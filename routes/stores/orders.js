const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    let orders = {}, demands = {}, receipts = {}, issues = {},
        promiseResults = require(`${process.env.ROOT}/fn/utils/promise_results`);
    require(`${process.env.ROOT}/fn/stores/orders`)  (m, orders);
    require(`${process.env.ROOT}/fn/stores/demands`) (m, demands);
    require(`${process.env.ROOT}/fn/stores/receipts`)(m, receipts);
    require(`${process.env.ROOT}/fn/stores/issues`)  (m, issues);
    app.get('/stores/orders',              permissions, allowed('access_orders'),                                 (req, res) => res.render('stores/orders/index', {download: req.query.download || null}));
    app.get('/stores/orders/:id',          permissions, allowed('access_orders'),                                 (req, res) => {
        m.stores.orders.findOne({
            where: {order_id: req.params.id},
            include: [inc.users({as: 'user_for', attributes: ['user_id']})],
            attributes: ['ordered_for']
        })
        .then(order => {
            if      (!order)                                                 res.error.redirect(new Error('Order not found'), req, res)
            else if (!req.allowed && order.ordered_for !== req.user.user_id) res.error.redirect(new Error('Permission Denied'), req, res)
            else res.render('stores/orders/show');
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/order_lines/:id',     permissions, allowed('access_orders',                   {allow: true}),(req, res) => {
        m.stores.order_lines.findOne({
            where: {line_id: req.params.id},
            attributes: ['order_id']
        })
        .then(line => {
            if (!line) res.error.redirect(new Error('Order line not found'), req, res)
            else       res.redirect('/stores/orders/' + line.order_id)
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    
    app.get('/stores/get/orders',          permissions, allowed('access_orders',      {send: true}),              (req, res) => {
        m.stores.orders.findAll({
            where:   req.query,
            include: [
                inc.users({as: 'user_for'}),
                inc.users({as: 'user_by'}),
                inc.order_lines()
            ]
        })
        .then(orders => res.send({result: true, orders: orders}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/order_lines',     permissions, allowed('access_order_lines', {send: true}),              (req, res) => {
        m.stores.order_lines.findAll({
            where:   req.query,
            include: [
                inc.sizes(),
                inc.orders(),
                inc.order_line_actions(),
                inc.users()
            ]
        })
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/order_lines/:id', permissions, allowed('access_order_lines', {send: true}),              (req, res) => {
        m.stores.order_lines.findAll({
            where: req.query,
            include: [
                inc.sizes(),
                inc.orders({
                    where: {ordered_for: req.params.id},
                    required: true
                })
            ]
        })
        .then(lines => res.send({result: true, order_lines: lines}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/orders',             permissions, allowed('order_add',          {send: true}),              (req, res) => {
        orders.create(
            req.body.ordered_for,
            req.user.user_id
        )
        .then(result => {
            let message = '';
            if (result.order.created) {
                res.send({
                    result: true,
                    message: `Order raised: ${result.order_id}`
                });
            } else {
                res.send({
                    result: true,
                    message: `Draft order already exists for this user: ${result.order_id}`
                });
        };
        })
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/order_lines',        permissions, allowed('order_line_add',     {send: true}),              (req, res) => {
        if (req.body.line.order_id) {
            orders.createLine({
                order_id: req.body.line.order_id,
                size_id:  req.body.line.size_id,
                _qty:     req.body.line._qty,
                user_id:  req.user.user_id
            })
            .then(result => res.send({result: true, message: `Item added: ${result.line.line_id}`}))
            .catch(err => res.error.send(err, res));
        } else if (req.body.ordered_for) {
            m.stores.orders.findOrCreate({
                where:    {ordered_for: req.body.ordered_for},
                defaults: {user_id:     req.user.user_id}
            })
            .then(([order, created]) => {
                return orders.createLine({
                    order_id: order.order_id,
                    size_id:  req.body.line.size_id,
                    _qty:     req.body.line._qty,
                    user_id:  req.user.user_id
                })
                .then(result => res.send({result: true, message: `Item added: ${result.line.line_id}`}))
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res))
        } else res.send({result: false, message: 'No order ID or user ID specified'});
    });

    app.put('/stores/orders/addtodemand',  permissions, allowed('demand_line_add',    {send: true}),              (req, res) => {
        m.stores.order_lines.findAll({
            where: {
                _status:        'Open',
                demand_line_id: null
            },
            attributes: ['line_id'],
            include: [
                inc.sizes({
                    where: {
                        supplier_id: req.body.supplier_id,
                        _orderable: 1
                    },
                    required: true
        })]})
        .then(order_lines => {
            if (order_lines && order_lines.length > 0) {
                let actions = [];
                order_lines.forEach(line => {
                    actions.push(
                        demand_order_line(
                            line.line_id,
                            req.user.user_id
                        )
                    );
                });
                Promise.allSettled(actions)
                .then(results => {
                    if (promiseResults(results)) {
                        res.send({result: true, message: order_lines.length + ' lines added to demand'});
                    } else res.error.send(new Error('Some lines failed', res));
                })
                .catch(err => res.error.send(err, res));
            } else {
                res.send({result: true, message: 'No order lines to demand'})
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/orders/:id',          permissions, allowed('order_edit',         {send: true}),              (req, res) => {
        m.stores.orders.findOne({
            where: {order_id: req.params.id},
            include: [inc.order_lines({where: {_status: 1}, attributes: ['line_id']})],
            attributes: ['order_id', 'ordered_for', '_status']
        })
        .then(order => {
            if (!order) {
                res.error.send('Order not found', res);
            } else if (order._status !== 1) {
                res.error.send(`Order must be in draft to be completed`, res);
            } else if (!order.lines || order.lines.length === 0) {
                res.error.send('A order must have at least one open line before you can complete it', res);
            } else {
                let actions = [];
                actions.push(order.update({_status: 2}));
                actions.push(
                    m.stores.order_lines.update(
                        {_status: 2},
                        {where:{
                            order_id: order.order_id,
                            _status: 1
                        }}
                    )
                );
                actions.push(
                    m.stores.notes.create({
                        _id:     req.params.id,
                        _table:  'orders',
                        _note:   'Completed',
                        _system: 1,
                        user_id: req.user.user_id
                    })
                );
                return Promise.all(actions)
                .then(result => res.send({result: true, message: `Order completed`}))
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/order_lines/:id',     permissions, allowed('order_edit',         {send: true}),              (req, res) => {
        return m.stores.orders.findOne({
            where: {order_id: req.params.id},
            attributes: ['order_id', '_status', 'ordered_for']
        })
        .then(order => {
            let actions = [], _demands = [], _receipts = [], _issues = [];
            for (let [lineID, line] of Object.entries(req.body.actions)) {
                line.line_id = Number(String(lineID).replace('line_id', ''));
                if (line._status === '3') { // if demand
                    _demands.push(line);
                } else if (line._status === '4') { //if receipt
                    _receipts.push(line);
                } else if (line._status === '5')   { // if issued
                    line.offset = _issues.length;
                    _issues.push(line)
                } else if (line._status === '6' || line._status === '0')   { // if complete
                    actions.push(
                        m.stores.order_lines.update(
                            {_status: line._status},
                            {where: {line_id: line.line_id}}
                        )
                    );
                    let note = '';
                    if (line._status === 0) note = 'Cancelled'
                    else if (line._status === 0) note = 'Completed'
                    actions.push(
                        m.stores.notes.create({
                            _id:     line.line_id,
                            _table:  'order_lines',
                            _note:   note,
                            user_id: req.user.user_id,
                            _system:  1
                        })
                    );
                };
            };
            if (_demands.length > 0) {
                _demands.forEach(line => {
                    actions.push(
                        demand_order_line(line.line_id, req.user.user_id)
                    );
                });
            };
            if (_receipts.length > 0) {
                _receipts.forEach(line => {
                    actions.push(
                        receive_order_line(line, req.user.user_id)
                    );
                });
            };
            if (_issues.length > 0) {
                actions.push(
                    issues.create({
                        issued_to: order.ordered_for,
                        user_id:   req.user.user_id
                    })
                    .then(issue_result => {
                        if (issue_result.success) {
                            return m.stores.issue_lines.count({
                                where: {issue_id: issue_result.issue.issue_id}
                            })
                            .then(line_count => {
                                _issues.forEach(line => {
                                    actions.push(
                                        issue_order_line(
                                            {
                                                issue_id: issue_result.issue.issue_id,
                                                count: line_count
                                            },
                                            line,
                                            req.user.user_id
                                        )
                                    );
                                });
                            })
                            .catch(err => {
                                console.log(err);
                            });
                        } else {
                            console.log(issue_result);
                        };
                    })
                    .catch(err => console.log(err))
                );
            };
            return Promise.allSettled(actions)
            .then(results => {
                return m.stores.order_lines.findAll({
                    where: {
                        _status: 2,
                        order_id: order.order_id
                    }
                })
                .then(order_lines => {
                    if (order_lines && order_lines.length > 0) {
                        if (promiseResults(results)) res.send({result: true, message: 'Lines actioned'})
                        else res.error.send('Some lines failed', res);
                    } else {
                        actions = [];
                        actions.push(order.update({_status: 3})
                        );
                        actions.push(
                            m.stores.notes.create({
                                _table: 'orders',
                                _note:   'Closed',
                                _id:     order.order_id,
                                user_id: req.user.user_id,
                                system:  1
                            })
                        );
                        return Promise.allSettled(actions)
                        .then(results2 => {
                            if (promiseResults(results)) res.send({result: true, message: 'Lines actioned, order closed'})
                            else res.error.send('Some lines failed', res);
                        })
                        .catch(err => res.error.send(err, res));
                    };
                })
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    
    app.delete('/stores/orders/:id',       permissions, allowed('order_delete',       {send: true}),              (req, res) => {
        m.stores.orders.findOne({
            where: {order_id: req.params.id},
            include: [inc.order_lines({actions: true, attributes: ['line_id', '_status', '_qty']})],
            attributes: ['order_id', '_status']
        })
        .then(order => {
            if (!order) {
                res.error.send('Order not found', res);
            } else if (order._status === 3) {
                res.error.send('Closed orders can not be cancelled', res);
            } else {
                let actions = [];
                order.lines.forEach(line => {
                    actions.push(cancel_order_line(line, req.user.user_id))
                });
                actions.push(
                    order.update({_status: 0})
                );
                Promise.allSettled(actions)
                .then(results => {
                    
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/order_lines/:id',  permissions, allowed('order_line_delete',  {send: true}),              (req, res) => { //
        m.stores.order_lines.findOne({
            where: {line_id: req.params.id},
            attributes: ['line_id', '_status', '_qty'],
            include: [inc.order_line_actions()]
        })
        .then(line => {
            cancel_order_line(line, req.user.user_id)
            .then(result => res.send(result))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    
    function cancel_order_line(line, user_id) {
        return new Promise((resolve, reject) => {
            let actions = [];
            if (line._status === 1 || line._status === 2 || line._status === 4) {
                actions.push(m.stores.order_lines.update({_status: 0}, {where: {line_id: line.line_id}}));
                actions.push(m.stores.notes.create({
                    _id: line.line_id,
                    _table: 'order_lines',
                    _note: `cancelled`,
                    _system: 1,
                    user_id: user_id
                }));
            } else if (line._status === 3) { // if demanded
                if (line.actions && line.actions.length > 0) {
                    let _demands = line.actions.filter(e => e.action.toLowerCase() === 'demand')
                    if (_demands.length > 0) {
                        _demands.forEach(demand => {
                            actions.push(
                                new Promise((resolve, reject) => {
                                    return m.stores.demand_lines.findOne({
                                        where: {demand_id: demand.action_line_id},
                                        attributes: ['line_id', '_status', '_qty']
                                    })
                                    .then(demand_line => {
                                        if (demand_line._status === 1) {
                                            let demand_actions = [];
                                            if (line._qty < demand_line._qty) {
                                                demand_actions.push(demand_line.decrement('_qty', {by: line._qty}));
                                                demand_actions.push(
                                                    m.stores.notes.create({
                                                        _id: demand_line.line_id,
                                                        _table: 'demand_lines',
                                                        _note: `Decremented by ${line._qty} from order line ${line.line_id} cancellation`,
                                                        _system: 1,
                                                        user_id: user_id
                                                    })
                                                );
                                            } else if (line._qty === demand_line._qty) {
                                                demand_actions.push(demand_line.update({_status: 0}));
                                                demand_actions.push(
                                                    m.stores.notes.create({
                                                        _id: demand_line.line_id,
                                                        _table: 'demand_lines',
                                                        _note: `Cancelled from order line ${line.line_id} cancellation`,
                                                        _system: 1,
                                                        user_id: user_id
                                                    })
                                                );
                                            } else resolve({result: false, message: 'Order qty is greater than demand qty'});
                                            if (demand_actions.length > 0) {
                                                Promise.allSettled(demand_actions)
                                                .then(results => {
                                                    if (promiseResults(results)) resolve({result: true, message: 'Demand line cancelled'})
                                                    else resolve({result: false, message: 'Some demand actions failed'})
                                                })
                                                .catch(err => reject(err));
                                            } else resolve({result: false, message: 'No demand action'});
                                        } else resolve({result: false, message: 'Only pending lines can be cancelled'})
                                    })
                                    .catch(err => reject(err));
                                })
                            );
                        });
                    };
                };
                actions.push(m.stores.order_lines.update({_status: 0}, {where: {line_id: line.line_id}}));
                actions.push(m.stores.notes.create({
                    _id: line.line_id,
                    _table: 'order_lines',
                    _note: `cancelled`,
                    _system: 1,
                    user_id: user_id
                }));
            };
            Promise.allSettled(actions)
            .then(results => {
                if (promiseResults(results)) resolve({result: true, message: 'Line cancelled'})
                else resolve({result: false, message: 'Some actions failed cancelling line'});
            })
            .catch(err => reject(err));
        });
    };
    function demand_order_line(line_id, user_id) {
        return new Promise((resolve, reject) => {
            return m.stores.order_lines.findOne({
                where:      {line_id: line_id},
                include:    [inc.sizes({attributes: ['supplier_id']})],
                attributes: ['line_id', 'size_id', '_qty']
            })
            .then(order_line => {
                if      (!order_line)                                                         resolve({success: false, message: 'Order line not found'});
                else if (!order_line.size)                                                    resolve({success: false, message: 'Size not found'});
                else if (!order_line.size.supplier_id || order_line.size.supplier_id === '') {resolve({success: false, message: 'Size does not have a supplier specified'});
                } else {
                    demands.create({
                        supplier_id: order_line.size.supplier_id,
                        user_id:     user_id
                    })
                    .then(demand_result => {
                        if (demand_result.success) {
                            demands.createLine({
                                demand_id: demand_result.demand.demand_id,
                                size_id:   order_line.size_id,
                                _qty:      order_line._qty,
                                user_id:   user_id,
                                note:      ` from order line ${order_line.line_id}`
                            })
                            .then(line_result => {
                                if (line_result.success) {
                                    let actions = [];
                                    actions.push(order_line.update({_status: 3}));
                                    actions.push(m.stores.order_line_actions.create({
                                        _action:        'Demand',
                                        order_line_id:  order_line.line_id,
                                        action_line_id: line_result.line.line_id,
                                        user_id:        user_id
                                    }));
                                    if (line_result.line.created) {
                                        actions.push(m.stores.notes.create({
                                            _id:     line_result.line.line_id,
                                            _table:  'demand_lines',
                                            _note:   `Created from order line ${order_line.line_id}`,
                                            user_id: req.user.user_id,
                                            _system: 1
                                        }));
                                    };
                                    Promise.allSettled(actions)
                                    .then(new_note => resolve(line_result))
                                    .catch(err => {
                                        console.log(err);
                                        resolve({success: true, message: 'Line demanded. Some errors occured', line: {line_id: line_result.line_Id}});
                                    });
                                } else resolve(line_result);
                            })
                            .catch(err => reject(err));
                        } else resolve(demand_result);
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    function receive_order_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return m.stores.order_lines.findOne({
                where: {line_id: line.line_id},
                include: [inc.sizes({attributes: ['supplier_id']})],
                attributes: ['line_id', 'size_id', '_qty']
            })
            .then(order_line => {
                if      (!order_line)                                                        resolve({success: false, message: 'Order line not found'});
                else if (!order_line.size)                                                   resolve({success: false, message: 'Size not found'});
                else if (!order_line.size.supplier_id || order_line.size.supplier_id === '') resolve({success: false, message: 'Size does not have a supplier specified'});
                else {
                    receipts.create({
                        supplier_id: order_line.size.supplier_id,
                        user_id: user_id
                    })
                    .then(receipt_result => {
                        if (receipt_result.success) {
                            receipts.createLine({
                                size_id:    order_line.size_id,
                                _qty:       order_line._qty,
                                receipt_id: receipt_result.receipt.receipt_id,
                                serials:    line.serials || null,
                                receive_to: {...line.location, ...{stock_id: line.stock_id}},
                                user_id:    user_id,
                                note:       ` from order line ${order_line.line_id}`
                            })
                            .then(line_result => {
                                if (line_result.success) {
                                    let actions = [];
                                    actions.push(order_line.update({_status: 4}))
                                    actions.push(m.stores.order_line_actions.create({
                                        _action:        'Receipt',
                                        order_line_id:  order_line.line_id,
                                        action_line_id: line_result.line.line_id,
                                        user_id:        user_id
                                    }));
                                    if (line_result.line.created) {
                                        actions.push(m.stores.notes.create({
                                            _id: line_result.line.line_id,
                                            _table:  'receipt_lines',
                                            _note:   `Created from order line ${order_line.line_id}`,
                                            user_id: user_id,
                                            _system: 1
                                        }));
                                    };
                                    Promise.allSettled(actions)
                                    .then(new_note => resolve(line_result))
                                    .catch(err => {
                                        console.log(err);
                                        resolve({success: true, message: 'Line received. Note not created', line: {line_id: line_result.line_Id}});
                                    })
                                } else resolve(line_result);
                            })
                            .catch(err => reject(err));
                        } else resolve(receipt_result);
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    function issue_order_line(issue, line, user_id) {
        new Promise((resolve, reject) => {
            return m.stores.order_lines.findOne({
                where:      {line_id: line.line_id},
                include:    [inc.orders()],
                attributes: ['line_id', 'size_id', 'order_id', '_qty']
            })
            .then(order_line => {
                if (!order_line) resolve({success: false, message: 'Order line not found'})
                else {
                    return issues.createLine({
                        serial_id: line.serial_id || null,
                        issue_id:  issue.issue_id,
                        stock_id:  line.stock_id  || null,
                        size_id:   order_line.size_id,
                        user_id:   user_id,
                        nsn_id:    line.nsn_id    || null,
                        _line:     issue.count + line.offset + 1,
                        _qty:      order_line._qty
                    })
                    .then(line_result => {
                        return m.stores.order_line_actions.create({
                            action_line_id: line_result.line.line_id,
                            order_line_id:  order_line.line_id,
                            user_id:        user_id,
                            _action:        'Issue'
                        })
                        .then(action_result => {
                            return order_line.update({_status: 6})
                            .then(order_line_result => resolve({success: true, message: 'Order line created'}))
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
};