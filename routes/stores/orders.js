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
    app.put('/stores/orders/:id',         loggedIn, allowed('order_edit',    {allow: true, send: true}), (req, res) => {
        m.orders.findOne({
            where: {order_id: req.params.id},
            include: [inc.order_lines({where: {_status: 1}, attributes: ['line_id']})],
            attributes: ['order_id', 'ordered_for', '_status']
        })
        .then(order => {
            let _note = '';
            if      (req.body._status === '0') _note = 'Cancelled'
            else if (req.body._status === '2') _note = 'Completed';
            if (!order) {
                res.error.send('Order not found', res);
            } else if (!req.allowed && req.user.user_id !== order.ordered_for) {
                res.error.send('Permission denied', res);
            } else if (order._status !== 1) {
                res.error.send(`Order must be in draft to be ${_note.toLowerCase()}`, res);
            } else if (req.body._status === '2' && (!order.lines || order.lines.length === 0)) {
                res.error.send('A order must have at least one open line before you can complete it', res);
            } else if (req.body._status !== '0' && req.body._status !== '2') {
                res.error.send('Invalid status requested', res);
            } else {
                let actions = [];
                actions.push(
                    order.update(
                        {_status: req.body._status},
                        {where: {order_id: order.order_id}}
                    )
                );
                actions.push(
                    m.notes.create({
                        _id:     req.params.id,
                        _table:  'orders',
                        _note:   _note,
                        _system: 1,
                        user_id: req.user.user_id
                    })
                );
                if (req.body._status === '0') {
                    actions.push(
                        m.order_lines.update(
                            {_status: 0},
                            {where: {order_id: req.params.id}}
                        )
                    );
                };
                return Promise.all(actions)
                .then(result => res.send({result: true, message: `Order ${_note.toLowerCase()}`}))
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
            for (let [lineID, order_line] of Object.entries(req.body.actions)) {
                let line = {};
                line.line_id = Number(String(lineID).replace('line_id', ''));
                line._status = order_line._status;
                console.log(line, order_line);
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
                        new Promise((resolve, reject) => {
                            return m.order_lines.findOne({
                                where: {line_id: line.line_id},
                                include: [inc.sizes()],
                                attributes: ['line_id', '_qty']
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
                                            demands: m.demands
                                        },
                                        supplier_id: order_line.size.supplier_id,
                                        user_id: req.user.user_id
                                    })
                                    .then(demand_result => {
                                        if (demand_result.success) {
                                            demands.createLine({
                                                m: {
                                                    sizes: m.sizes,
                                                    demands: m.demand_lines,
                                                    demand_lines: m.demand_lines,
                                                    notes: m.notes
                                                },
                                                demand_id: demand_result.demand.demand_id,
                                                size_id: order_line.size,
                                                _qty: order_line._qty,
                                                user_id: req.user.user_id,
                                                note: ` from order line ${order_line.line_id}`
                                            })
                                            .then(line_result => {
                                                //if created add note
                                                //resolve promise
                                            })
                                            .catch(err => reject(err));
                                        } else {
                                            resolve({
                                                success: false,
                                                message: demand_result.message
                                            });
                                        };
                                    })
                                    .catch(err => reject(err));
                                };
                            })
                            .catch(err => reject(err));
                        })
                    );

                });
            };
            if (_receipts.length > 0) {

            };
            if (_issues.length > 0) {

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
                            // m.orders.update(
                            //     {_closed: 1},
                            //     {where: {order_id: order.order_id}}
                            // )
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
        m.order_lines.destroy({where: {order_id: req.params.id}})
        .then(result => {
            m.orders.destroy({where: {order_id: req.params.id}})
            .then(result => res.send({result: true, message: 'Order deleted'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/order_lines/:id', loggedIn, allowed('order_line_delete',          {send: true}), (req, res) => { //
        m.order_lines.findOne({where: {line_id: req.params.id}})
        .then(line => {
            m.order_lines.update(
                {_status: 'Cancelled'},
                {where: {line_id: req.params.id}}
            )
            .then(result => {
                m.notes.create({
                    _table:  'orders',
                    _note:   'Line ' + req.params.id + ' cancelled',
                    _id:     line.order_id,
                    user_id: req.user.user_id,
                    _system:  1
                })
                .then(result => res.send({result: true, message: 'Line cancelled'}))
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });

    demand_order_line = (line_id, user_id) => new Promise((resolve, reject) => {
        m.order_lines.findOne({
            where: {line_id: line_id},
            include: [inc.sizes({attributes: ['supplier_id']})],
            attributes: ['line_id', 'size_id', '_qty']
        })
        .then(line => {
            if (!line.size.supplier_id && line.size.supplier_id === '') reject(new Error('Size does not have a supplier'))
            else {
                demands.create({
                    m: {
                        suppliers: m.suppliers,
                        demands:   m.demands
                    },
                    supplier_id: line.size.supplier_id,
                    user_id:     user_id
                })
                .then(demand => {
                    demands.createLine({
                        m: {
                            sizes: m.sizes,
                            orders: m.orders,
                            order_lines: m.order_lines
                        },
                        demand_id: demand.demand_id,
                        size_id:   line.size_id,
                        _qty:      line._qty,
                        user_id:   user_id,
                        note_addition: ` from order line ${line.line_id}`
                    })
                    .then(demand_line => {
                        line.update({
                            _status: 2,
                            demand_line_id: demand_line.line_id
                        })
                        // m.order_lines.update(
                        //     {demand_line_id: demand_line_id},
                        //     {where: {line_id: line_id}}
                        // )
                        .then(result => resolve(demand_line.line_id))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    });
    receive_order_line = (line, user_id) => new Promise((resolve, reject) => {
        m.order_lines.findOne({
            where: {line_id: line.line_id},
            include: [
                inc.sizes(),
                inc.orders()
        ]})
        .then(order_line => {
            receipts.create({
                m: {receipts: m.receipts},
                supplier_id: order_line.size.supplier_id,
                user_id:     user_id
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
                        sizes:         m.sizes,
                        stock:         m.stock,
                        receipts:      m.receipts,
                        serials:       m.serials,
                        locations:     m.locations,
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
                    m.order_lines.update(
                        update_line,
                        {where: {line_id: line_id}})
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
        m.order_lines.findOne({
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
