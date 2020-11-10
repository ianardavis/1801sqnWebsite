const op = require('sequelize').Op;
module.exports = (app, allowed, inc, loggedIn, m) => {
    let orders   = require(process.env.ROOT + '/fn/orders'),
        demands  = require(process.env.ROOT + '/fn/demands'),
        receipts = require(process.env.ROOT + '/fn/receipts'),
        issues   = require(process.env.ROOT + '/fn/issues'),
        utils    = require(process.env.ROOT + '/fn/utils');
    app.get('/stores/orders',             loggedIn, allowed('access_orders'),                            (req, res) => res.render('stores/orders/index', {download: req.query.download || null}));
    app.get('/stores/orders/:id',         loggedIn, allowed('access_orders'),                            (req, res) => {
        m.orders.findOne({
            where: {order_id: req.params.id},
            include: [inc.users({as: 'user_for', attributes: ['user_id']})],
            attributes: ['ordered_for']
        })
        .then(order => {
            if (!order) res.error.redirect(new Error('Order not found'), req, res)
            else if (!req.allowed && order.ordered_for !== req.user.user_id) res.error.redirect(new Error('Permission Denied'), req, res)
            else res.render('stores/orders/show', {tab: req.query.tab || 'details'});
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/order_lines/:id',    loggedIn, allowed('access_orders', {allow: true}),             (req, res) => {
        m.order_lines.findOne({
            where: {line_id: req.params.id},
            attributes: ['order_id']
        })
        .then(line => {
            if (!line) res.error.redirect(new Error('Order line not found'), req, res)
            else res.redirect('/stores/orders/' + line.order_id)
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    
    app.post('/stores/orders',            loggedIn, allowed('order_add',                  {send: true}), (req, res) => {
        orders.create({
            m: {
                orders: m.orders,
                users:  m.users
            },
            ordered_for: req.body.ordered_for,
            user_id: req.user.user_id
        })
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
    app.post('/stores/order_lines',       loggedIn, allowed('order_line_add',             {send: true}), (req, res) => {
        orders.createLine({
            m: {
                order_lines: m.order_lines,
                orders:      m.orders,
                sizes:       m.sizes,
                notes:       m.notes
            },
            order_id: req.body.line.order_id,
            size_id:  req.body.line.size_id,
            _qty:     req.body.line._qty,
            user_id:  req.user.user_id
        })
        .then(result => res.send({result: true, message: `Item added: ${result.line.line_id}`}))
        .catch(err => res.error.send(err, res));
    });

    app.put('/stores/orders/addtodemand', loggedIn, allowed('demand_line_add',            {send: true}), (req, res) => {
        m.order_lines.findAll({
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
                    if (utils.promiseResults(results)) {
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
    app.put('/stores/orders/:id',         loggedIn, allowed('order_edit',                 {send: true}), (req, res) => {
        m.orders.findOne({
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
                    m.order_lines.update(
                        {_status: 2},
                        {where:{
                            order_id: order.order_id,
                            _status: 1
                        }}
                    )
                );
                actions.push(
                    m.notes.create({
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
    app.put('/stores/order_lines/:id',    loggedIn, allowed('order_edit',                 {send: true}), (req, res) => {
        m.orders.findOne({
            where: {order_id: req.params.id},
            attributes: ['order_id', '_status']
        })
        .then(order => {
            let actions = [], _demands = [], _receipts = [], _issues = [];
            for (let [lineID, line] of Object.entries(req.body.actions)) {
                line.line_id = Number(String(lineID).replace('line_id', ''));
                console.log(line);
                if (line._status === '3') { // if demand
                    _demands.push(line);
                } else if (line._status === '4') { //if receipt
                    _receipts.push(line);
                } else if (line._status === '5')   { // if issued
                    line.offset = _issues.length;
                    _issues.push(line)
                } else if (line._status === '6' || line._status === '0')   { // if complete
                    actions.push(
                        m.order_lines.update(
                            {_status: line._status},
                            {where: {line_id: line.line_id}}
                        )
                    );
                    let note = '';
                    if (line._status === 0) note = 'Cancelled'
                    else if (line._status === 0) note = 'Completed'
                    actions.push(
                        m.notes.create({
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
                issues.create({
                    m: {
                        users:  m.users,
                        issues: m.issues
                    },
                    issued_to: order_line.order.ordered_for,
                    user_id:   req.user.user_id
                })
                .then(issue_result => {
                    if (issue_result.success) {
                        _issues.forEach(line => {
                            actions.push(
                                new Promise((resolve, reject) => {
                                    return m.order_lines.findOne({
                                        where: {line_id: line.line_id},
                                        include: [inc.orders()],
                                        attributes: ['line_id', '_qty']
                                    })
                                    .then(order_line => {
                                        if (!order_line) {
                                            resolve({
                                                success: false,
                                                message: 'Order line not found'
                                            })
                                        } else {
                                            issues.createLine({
                                                m: {

                                                }
                                            })
                                        };
                                    })
                                    .catch(err => reject(err));
                                })
                            );
                        });
                    } else resolve(issue_result);
                })
                .catch(err => console.log(err));
            };
            Promise.all(actions)
            .then(results => {
                m.order_lines.findAll({
                    where: {
                        _status: 'Open',
                        order_id: order.order_id
                    }
                })
                .then(order_lines => {
                    if (order_lines && order_lines.length > 0) {
                        if (utils.promiseResults(results)) res.send({result: true, message: 'Lines actioned'})
                        else res.error.send('Some lines failed', res);
                    } else {
                        actions = [];
                        actions.push(order.update({_status: 3})
                        );
                        actions.push(
                            m.notes.create({
                                _table: 'orders',
                                _note:   'Closed',
                                _id:     order.order_id,
                                user_id: req.user.user_id,
                                system:  1
                            })
                        );
                        Promise.allSettled(actions)
                        .then(results2 => {
                            if (utils.promiseResults(results)) res.send({result: true, message: 'Lines actioned, order closed'})
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
    
    app.delete('/stores/orders/:id',      loggedIn, allowed('order_delete',               {send: true}), (req, res) => {
        m.orders.findOne({
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
    app.delete('/stores/order_lines/:id', loggedIn, allowed('order_line_delete',          {send: true}), (req, res) => { //
        m.order_lines.findOne({
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
                actions.push(
                    m.order_lines.update({_status: 0}, {where: {line_id: line.line_id}})
                );
                actions.push(
                    m.notes.create({
                        _id: line.line_id,
                        _table: 'order_lines',
                        _note: `cancelled`,
                        _system: 1,
                        user_id: user_id
                    })
                );
            } else if (line._status === 3) { // if demanded
                if (line.actions && line.actions.length > 0) {
                    demands = line.actions.filter(e => e.action.toLowerCase() === 'demand')
                    if (demands.length > 0) {
                        demands.forEach(demand => {
                            actions.push(
                                new Promise((resolve, reject) => {
                                    return m.demand_lines.findOne({
                                        where: {demand_id: demand.action_line_id},
                                        attributes: ['line_id', '_status', '_qty']
                                    })
                                    .then(demand_line => {
                                        if (demand_line._status === 1) {
                                            let demand_actions = [];
                                            if (line._qty < demand_line._qty) {
                                                demand_actions.push(demand_line.decrement('_qty', {by: line._qty}));
                                                demand_actions.push(
                                                    m.notes.create({
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
                                                    m.notes.create({
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
                                                    if (utils.promiseResults(results)) resolve({result: true, message: 'Demand line cancelled'})
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
                actions.push(
                    m.order_lines.update({_status: 0}, {where: {line_id: line.line_id}})
                );
                actions.push(
                    m.notes.create({
                        _id: line.line_id,
                        _table: 'order_lines',
                        _note: `cancelled`,
                        _system: 1,
                        user_id: user_id
                    })
                );
            };
            Promise.allSettled(actions)
            .then(results => {
                if (utils.promiseResults(results)) resolve({result: true, message: 'Line cancelled'})
                else resolve({result: false, message: 'Some actions failed cancelling line'});
            })
            .catch(err => reject(err));
        });
    };
    function demand_order_line(line_id, user_id) {
        return new Promise((resolve, reject) => {
            return m.order_lines.findOne({
                where:      {line_id: line_id},
                include:    [inc.sizes({attributes: ['supplier_id']})],
                attributes: ['line_id', 'size_id', '_qty']
            })
            .then(order_line => {
                if (!order_line) {
                    resolve({
                        success: false,
                        message: 'Order line not found'
                    });
                } else if (!order_line.size) {
                    resolve({
                        success: false,
                        message: 'Size not found'
                    });
                } else if (!order_line.size.supplier_id || order_line.size.supplier_id === '') {
                    resolve({
                        success: false,
                        message: 'Size does not have a supplier specified'
                    });
                } else {
                    demands.create({
                        m: {
                            suppliers: m.supplier,
                            demands:   m.demands
                        },
                        supplier_id: order_line.size.supplier_id,
                        user_id:     user_id
                    })
                    .then(demand_result => {
                        if (demand_result.success) {
                            demands.createLine({
                                m: {
                                    demand_lines: m.demand_lines,
                                    demands:      m.deman_lines,
                                    sizes:        m.sizes,
                                    notes:        m.notes
                                },
                                demand_id: demand_result.demand.demand_id,
                                size_id:   order_line.size_id,
                                _qty:      order_line._qty,
                                user_id:   user_id,
                                note:      ` from order line ${order_line.line_id}`
                            })
                            .then(line_result => {
                                if (line_result.success) {
                                    let actions = [];
                                    actions.push(
                                        order_line.update({_status: 3})
                                    );
                                    actions.push(
                                        m.order_line_actions.create({
                                            _action:        'Demand',
                                            order_line_id:  order_line.line_id,
                                            action_line_id: line_result.line.line_id,
                                            user_id:        user_id
                                        })
                                    );
                                    if (line_result.line.created) {
                                        actions.push(
                                            m.notes.create({
                                                _id:     line_result.line.line_id,
                                                _table:  'demand_lines',
                                                _note:   `Created from order line ${order_line.line_id}`,
                                                user_id: req.user.user_id,
                                                _system: 1
                                            })
                                        );
                                    };
                                    Promise.allSettled(actions)
                                    .then(new_note => resolve(line_result))
                                    .catch(err => {
                                        console.log(err);
                                        resolve({
                                            success: true,
                                            message: 'Line demanded. Some errors occured',
                                            line:    {line_id: line_result.line_Id}
                                        });
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
            return m.order_lines.findOne({
                where: {line_id: line.line_id},
                include: [inc.sizes({attributes: ['supplier_id']})],
                attributes: ['line_id', 'size_id', '_qty']
            })
            .then(order_line => {
                if (!order_line) {
                    resolve({
                        success: false,
                        message: 'Order line not found'
                    });
                } else if (!order_line.size) {
                    resolve({
                        success: false,
                        message: 'Size not found'
                    });
                } else if (!order_line.size.supplier_id || order_line.size.supplier_id === '') {
                    resolve({
                        success: false,
                        message: 'Size does not have a supplier specified'
                    });
                } else {
                    receipts.create({
                        m: {
                            suppliers: m.supplier,
                            receipts: m.receipts
                        },
                        supplier_id: order_line.size.supplier_id,
                        user_id: user_id
                    })
                    .then(receipt_result => {
                        if (receipt_result.success) {
                            console.log('orders.js:332:', line);
                            receipts.createLine({
                                m: {
                                    sizes:         m.sizes,
                                    receipts:      m.receipt_lines,
                                    receipt_lines: m.receipt_lines,
                                    notes:         m.notes
                                },
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
                                    actions.push(
                                        order_line.update({_status: 4})
                                    )
                                    actions.push(
                                        m.order_line_actions.create({
                                            _action:        'Receipt',
                                            order_line_id:  order_line.line_id,
                                            action_line_id: line_result.line.line_id,
                                            user_id:        user_id
                                        })
                                    );
                                    if (line_result.line.created) {
                                        actions.push(
                                            m.notes.create({
                                                _id: line_result.line.line_id,
                                                _table:  'receipt_lines',
                                                _note:   `Created from order line ${order_line.line_id}`,
                                                user_id: user_id,
                                                _system: 1
                                            })
                                        );
                                    };
                                    Promise.allSettled(actions)
                                    .then(new_note => resolve(line_result))
                                    .catch(err => {
                                        console.log(err);
                                        resolve({
                                            success: true,
                                            message: 'Line received. Note not created',
                                            line: {line_id: line_result.line_Id}
                                        });
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
    function issue_order_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return m.order_lines.findOne({
                where: {line_id: line.line_id},
                include: [inc.orders()]
            })
            .then(order_line => {
                if (Number(order_line.order.ordered_for) !== -1) {
                    issues.create({
                        m: {issues: m.issues},
                        issue: {
                            issued_to: order_line.order.ordered_for,
                            _date_due: utils.addYears(7),
                            user_id:   user_id
                        }
                    })
                    .then(result => {
                        m.issue_lines.findAll({where: {issue_id: result.issue_id}})
                        .then(issue_lines => {
                            let line_id = line.line_id;
                            line.issue_id = result.issue_id;
                            line.user_id  = user_id;
                            line.size_id  = order_line.size_id;
                            line._line    = line.offset + issue_lines.length
                            line._qty     = order_line._qty;
                            delete line.line_id
                            issues.createLine({
                                m: {
                                    sizes: m.sizes,
                                    issues: m.issues,
                                    issue_lines: m.issue_lines,
                                    serials: m.serials,
                                    stock: m.stock
                                },
                                line: line
                            })
                            .then(issue_line_id => {
                                let update_line = {
                                    issue_line_id: issue_line_id,
                                    _status: 'Complete'
                                };
                                if (!order_line.demand_line_id) update_line.demand_line_id = -1;
                                if (!order_line.receipt_line_id) update_line.receipt_line_id = -1;
                                m.order_lines.update(
                                    update_line,
                                    {where: {line_id: line_id}}
                                )
                                .then(result => resolve(issue_line_id))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                } else {
                    reject(new Error('Orders for backing stock can not be issued'))
                };
            })
            .catch(err => reject(err));
        });
    };
};