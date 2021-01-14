const op = require('sequelize').Op;
module.exports = (app, al, inc, pm, m) => {
    let orders = {}, demands = {}, receipts = {}, issues = {},
        promiseResults = require(`../functions/promise_results`);
    require(`./functions/orders`) (m, orders);
    require(`./functions/demands`)(m, demands);
    // require(`./functions/receipts`)(m, receipts);
    app.get('/stores/orders',             pm, al('access_orders'),                    (req, res) => res.render('stores/orders/index', {download: req.query.download || null}));
    app.get('/stores/orders/:id',         pm, al('access_orders'),                    (req, res) => res.render('stores/orders/show'));
    
    app.get('/stores/get/orders',         pm, al('access_orders',      {send: true}), (req, res) => {
        m.stores.orders.findAll({
            where:   req.query,
            include: [
                inc.sizes(),
                inc.users()
            ]
        })
        .then(orders => res.send({success: true, result: orders}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/order',          pm, al('access_orders',      {send: true}), (req, res) => {
        m.stores.orders.findOne({
            where:   req.query,
            include: [
                inc.sizes(),
                inc.users()
            ]
        })
        .then(order => res.send({success: true, result: order}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/order_actions',  pm, al('access_order_lines', {send: true}), (req, res) => {
        m.stores.order_actions.findAll({
            where:   req.query,
            include: [
                inc.stocks(),
                inc.nsns(),
                inc.serials(),
                inc.demand_lines(),
                inc.issue(),
                inc.users()
            ]
        })
        .then(order_line_actions => res.send({success: true, result: order_line_actions}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/orders',            pm, al('order_add',          {send: true}), (req, res) => {
        orders.create(req.body.line, req.user.user_id)
        .then(result => res.send(result))
        .catch(err => res.send({success: false, message: err.message}));
    });

    app.put('/stores/orders/addtodemand', pm, al('demand_line_add',    {send: true}), (req, res) => {
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
                        res.send({success: true, message: order_lines.length + ' lines added to demand'});
                    } else res.error.send(new Error('Some lines failed', res));
                })
                .catch(err => res.error.send(err, res));
            } else {
                res.send({success: true, message: 'No order lines to demand'})
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/orders/:id',         pm, al('order_edit',         {send: true}), (req, res) => {
        m.stores.orders.findOne({
            where: {order_id: req.params.id},
            attributes: ['order_id', '_status']
        })
        .then(order => {
            if      (!order)                                   res.send({success: false, message: 'Order not found'});
            else if (order._status !== 1)                      res.send({success: false, message: `Order must be in draft to be completed`});
            else if (!order.lines || order.lines.length === 0) res.send({success: false, message: 'A order must have at least one open line before you can complete it'});
            else {
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
                .then(result => res.send({success: true, message: `Order completed`}))
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    
    app.delete('/stores/orders/:id',      pm, al('order_delete',       {send: true}), (req, res) => {
        m.stores.orders.findOne({
            where:      {order_id: req.params.id},
            attributes: ['order_id', '_status']
        })
        .then(order => {
            if      (!order)              res.send({success: false, message: 'Order not found'});
            else if (order._status !== 1) res.send({success: false, message: 'Only Placed orders can be cancelled'});
            else {
                order.update({_status: 0})
                .then(results => {
                    if (!result) res.send({success: false, message: 'Order not cancelled'})
                    else         res.send({success: true,  message: 'Order cancelled'});
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    
    function cancel_order_line(line, user_id) {
        return new Promise((resolve, reject) => {
            let actions = [];
            if (line._status === 1 || line._status === 2 || line._status === 4) {
                actions.push(m.stores.order_lines.update({_status: 0}, {where: {line_id: line.line_id}}));
                actions.push(m.stores.order_line_actions.create({
                    order_line_id: line.line_id,
                    _action: `cancelled`,
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
                                                    m.stores.demand_line_actions.create({
                                                        demand_line_id: demand_line.line_id,
                                                        action_line_id: line.line_id,
                                                        _action: `Decremented by ${line._qty} from order line cancellation`,
                                                        user_id: user_id
                                                    })
                                                );
                                            } else if (line._qty === demand_line._qty) {
                                                demand_actions.push(demand_line.update({_status: 0}));
                                                demand_actions.push(
                                                    m.stores.demand_line_actions.create({
                                                        demand_line_id: demand_line.line_id,
                                                        action_line_id: line.line_id,
                                                        _action: `Cancelled from order line cancellation`,
                                                        user_id: user_id
                                                    })
                                                );
                                            } else resolve({success: false, message: 'Order qty is greater than demand qty'});
                                            if (demand_actions.length > 0) {
                                                Promise.allSettled(demand_actions)
                                                .then(results => {
                                                    if (promiseResults(results)) resolve({success: true, message: 'Demand line cancelled'})
                                                    else resolve({success: false, message: 'Some demand actions failed'})
                                                })
                                                .catch(err => reject(err));
                                            } else resolve({success: false, message: 'No demand action'});
                                        } else resolve({success: false, message: 'Only pending lines can be cancelled'})
                                    })
                                    .catch(err => reject(err));
                                })
                            );
                        });
                    };
                };
                actions.push(m.stores.order_lines.update({_status: 0}, {where: {line_id: line.line_id}}));
                actions.push(m.stores.order_line_actions.create({
                    order_line_id: line.line_id,
                    _action: `Cancelled`,
                    user_id: user_id
                }));
            };
            Promise.allSettled(actions)
            .then(results => {
                if (promiseResults(results)) resolve({success: true, message: 'Line cancelled'})
                else resolve({success: false, message: 'Some actions failed cancelling line'});
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
                                        actions.push(m.stores.demand_line_actions.create({
                                            demand_line_id: line_result.line.line_id,
                                            action_line_id:  order_line.line_id,
                                            _action:   `Created from order line`,
                                            user_id: req.user.user_id
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
                                        actions.push(m.stores.receipt_line_actions.create({
                                            receipt_line_id: line_result.line.line_id,
                                            action_line_id: order_line.line_id,
                                            _action:   `Created from order line`,
                                            user_id: user_id
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