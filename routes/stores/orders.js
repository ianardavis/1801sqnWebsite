const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db       = require(process.env.ROOT + '/fn/db'),
        orders   = require(process.env.ROOT + '/fn/orders'),
        demands  = require(process.env.ROOT + '/fn/demands'),
        receipts = require(process.env.ROOT + '/fn/receipts'),
        issues   = require(process.env.ROOT + '/fn/issues'),
        utils    = require(process.env.ROOT + '/fn/utils');
    app.get('/stores/orders',             isLoggedIn, allowed('access_orders'),                                 (req, res) => {
        m.suppliers.findAll()
        .then(suppliers => {
            res.render('stores/orders/index',{
                suppliers: suppliers,
                download:  req.query.download || null
            });
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/orders/:id',         isLoggedIn, allowed('access_orders'),                                 (req, res) => {
        db.findOne({
            table: m.orders,
            where: {order_id: req.params.id},
            include: [
                inc.users({as: '_for'}),
                inc.users({as: '_by'})
        ]})
        .then(order => {
            if (req.allowed || order.orderedFor.user_id === req.user.user_id) {
                res.render('stores/orders/show',{
                    order: order,
                    notes: {table: 'orders', id: order.order_id},
                    show_tab: req.query.tab || 'details'
                });
            } else res.error.redirect(new Error('Permission Denied'), req, res);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/order_lines/:id',    isLoggedIn, allowed('access_orders',      {allow: true}),             (req, res) => {
        db.findOne({
            table: m.order_lines,
            where: {line_id: req.params.id}
        })
        .then(line => res.redirect('/stores/orders/' + line.order_id))
        .catch(err => res.error.redirect(err, req, res));
    });
    
    app.get('/stores/get/orders',         isLoggedIn, allowed('access_orders',      {send: true}),              (req, res) => {
        m.orders.findAll({
            where: req.query,
            include: [
                inc.users({as: '_for'}),
                inc.users({as: '_by'}),
                inc.order_lines()
        ]})
        .then(orders => res.send({result: true, orders: orders}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/orderlines',     isLoggedIn, allowed('access_order_lines', {send: true}),              (req, res) => {
        m.order_lines.findAll({
            where: req.query,
            include: [
                inc.sizes(),
                inc.orders(),
                inc.demand_lines( {as: 'demand_line',  demands: true}),
                inc.receipt_lines({as: 'receipt_line', receipts: true}),
                inc.issue_lines(  {as: 'issue_line',   issues: true})
        ]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/orderlines/:id', isLoggedIn, allowed('access_order_lines', {send: true}),              (req, res) => {
        m.order_lines.findAll({
            where: req.query,
            include: [
                inc.sizes(),
                inc.orders({
                    where: {ordered_for: req.params.id},
                    required: true
        })]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/orders',            isLoggedIn, allowed('order_add',          {send: true}),              (req, res) => {
        orders.create({
            m: {orders: m.orders},
            order: {
                ordered_for: req.body.ordered_for,
                user_id: req.user.user_id
            }
        })
        .then(order_id => {
            let message = 'Order raised: ';
            if (!result.created) message = 'There is already an order open for this user: ';
            res.send({result: true, message: message + order_id})
        })
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/order_lines/:id',   isLoggedIn, allowed('order_line_add',     {send: true}),              (req, res) => {
        req.body.line.order_id = req.params.id;
        req.body.line.user_id  = req.user.user_id;
        orders.createLine({
            m: {
                sizes: m.sizes,
                orders: m.orders,
                order_lines: m.order_lines
            },
            line: req.body.line
        })
        .then(line_id => res.send({result: true, message: 'Item added: ' + line_id}))
        .catch(err => res.error.send(err, res))
    });

    app.put('/stores/orders/addtodemand', isLoggedIn, allowed('demand_line_add',    {send: true}),              (req, res) => {
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
    app.put('/stores/orders/:id',         isLoggedIn, allowed('order_edit',         {allow: true, send: true}), (req, res) => {
        m.orders.findOne({
            where: {order_id: req.params.id},
            include: [inc.order_lines({where: {_status: {[op.not]: 'Cancelled'}}})]
        })
        .then(order => {
            if (!order.lines || order.lines.length === 0) {
                res.error.send('An order must have at least one open line before you can complete it', res);
            } else if (order._complete) {
                res.error.send('Order is already complete', res);
            } else if (!req.allowed && req.user.user_id !== order.ordered_for) {
                res.error.send('Permission denied', res);
            } else {
                let actions = [];
                actions.push(
                    db.update({
                        table: m.orders,
                        where: {order_id: req.params.id},
                        record: {_complete: 1}
                    })
                );
                actions.push(
                    db.update({
                        table: m.order_lines,
                        where: {
                            order_id: req.params.id,
                            _status: 'Pending'
                        },
                        record: {_status: 'Open'}
                    })
                );
                Promise.allSettled(actions)
                .then(result => {
                    if (utils.promiseResults(result)) {
                        m.notes.create({
                            _table:  'orders',
                            _note:   'Completed',
                            _id:     req.params.id,
                            user_id: req.user.user_id,
                            system: 1
                        })
                        .then(note => res.send({result: true, message: 'Order completed'}))
                        .catch(err => res.error.send(err, res));
                    } else res.error.send('Some actions have failed', res, result)
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/order_lines/:id',    isLoggedIn, allowed('order_edit',         {send: true}),              (req, res) => {
        db.findOne({
            table: m.orders,
            where: {order_id: req.params.id}
        })
        .then(order => {
            let issues = utils.counter(), actions = [];
            for (let [lineID, line] of Object.entries(req.body.actions)) {
                line.line_id = Number(String(lineID).replace('line_id', ''));
                if (line._status === 'Demand') {
                    actions.push(
                        demand_order_line(
                            line.line_id,
                            req.user.user_id
                        )
                    );
                } else if (line._status === 'Receive') {
                    actions.push(
                        receive_order_line(
                            line,
                            req.user.user_id
                        )
                    );
                } else if (line._status === 'Issue')   {
                    line.offset = issues();
                    actions.push(
                        issue_order_line(
                            line,
                            req.user.user_id
                        )
                    );
                } else if (line._status === 'Cancel') {
                    actions.push(
                        db.update({
                            table: m.order_lines,
                            where: {line_id: line.line_id},
                            record: {_status: 'Cancelled'}
                        })
                    );
                    actions.push(
                        m.notes.create({
                            _id:     order.order_id,
                            _table:  'orders',
                            _note:   'Line ' + line.line_id + ' cancelled',
                            user_id: req.user.user_id,
                            system:  1
                        })
                    );
                };
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
                        actions.push(
                            db.update({
                                table: m.orders,
                                where: {order_id: order.order_id},
                                record: {_closed: 1}
                            })
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
    app.delete('/stores/orders/:id',      isLoggedIn, allowed('order_delete',       {send: true}),              (req, res) => {
        m.order_lines.destroy(where: {order_id: req.params.id})
        .then(result => {
            db.destroy({
                table: m.orders,
                where: {order_id: req.params.id}
            })
            .then(result => res.send({result: true, message: 'Order deleted'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/order_lines/:id', isLoggedIn, allowed('order_line_delete',  {send: true}),              (req, res) => {
        db.findOne({
            table: m.order_lines,
            where: {line_id: req.params.id}
        })
        .then(line => {
            db.update({
                table: m.order_lines,
                where: {line_id: req.params.id},
                record: {_status: 'Cancelled'}
            })
            .then(result => {
                m.notes.create({
                    _table:  'orders',
                    _note:   'Line ' + req.params.id + ' cancelled',
                    _id:     line.order_id,
                    user_id: req.user.user_id,
                    system:  true
                })
                .then(result => res.send({result: true, message: 'Line cancelled'}))
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    
    demand_order_line = (line_id, user_id) => new Promise((resolve, reject) => {
        db.findOne({
            table: m.order_lines,
            where: {line_id: line_id},
            include: [inc.sizes()]
        })
        .then(order_line => {
            demands.create({
                m: {
                    suppliers: m.suppliers,
                    demands:   m.demands
                },
                demand: {
                    supplier_id: order_line.size.supplier_id,
                    user_id:     user_id
                }
            })
            .then(result => {
                demands.createLine({
                    m: {
                        sizes: m.sizes,
                        orders: m.orders,
                        order_lines: m.order_lines
                    },
                    line: {
                        demand_id: result.demand_id,
                        size_id:   order_line.size_id,
                        _qty:      order_line._qty,
                        user_id:   user_id
                    }
                })
                .then(demand_line_id => {
                    db.update({
                        table: m.order_lines,
                        where: {line_id: line_id},
                        record: {demand_line_id: demand_line_id}
                    })
                    .then(result => resolve(demand_line_id))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
    receive_order_line = (line, user_id) => new Promise((resolve, reject) => {
        db.findOne({
            table: m.order_lines,
            where: {line_id: line.line_id},
            include: [
                inc.sizes(),
                inc.orders()
        ]})
        .then(order_line => {
            receipts.create({
                m: {receipts: m.receipts},
                receipt: {
                    supplier_id: order_line.size.supplier_id,
                    user_id:     user_id
                }
            })
            .then(result => {
                let line_id = line.line_id;
                line.supplier_id = order_line.size.supplier_id;
                line.receipt_id  = result.receipt_id;
                line.size_id     = order_line.size_id;
                line._qty        = order_line._qty;
                line.user_id     = user_id;
                delete line.line_id;
                receipts.createLine({
                    m: {
                        sizes: m.sizes,
                        stock: m.stock,
                        receipts: m.receipts,
                        serials: m.serials,
                        receipt_lines: m.receipt_lines
                    },
                    line: line
                })
                .then(receipt_line_id => {
                    let update_line = {receipt_line_id: receipt_line_id};
                    if (Number(order_line.order.ordered_for) === -1) {
                        update_line._status = 'Complete';
                        update_line.issue_line_id = -1;
                    };
                    if (!order_line.demand_line_id) update_line.demand_line_id = -1;
                    db.update({
                        table: m.order_lines,
                        where: {line_id: line_id},
                        record: update_line
                    })
                    .then(result => resolve(receipt_line_id))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
    issue_order_line = (line, user_id) => new Promise((resolve, reject) => {
        db.findOne({
            table: m.order_ines,
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
                            db.update({
                                table: m.order_lines,
                                where: {line_id: line_id},
                                record: update_line
                            })
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
