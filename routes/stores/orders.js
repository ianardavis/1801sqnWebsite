const op = require('sequelize').Op;
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //INDEX
    app.get('/stores/orders',             isLoggedIn, allowed('access_orders'),                                 (req, res) => {
        fn.getAllWhere(
            m.suppliers,
            {supplier_id: {[op.not]: 3}}
        )
        .then(suppliers => {
            res.render('stores/orders/index',{
                suppliers: suppliers,
                download:  req.query.download || null
            });
        })
        .catch(err => fn.error(err, '/stores', req, res));
    });
    //SHOW
    app.get('/stores/orders/:id',         isLoggedIn, allowed('access_orders'),                                 (req, res) => {
        fn.getOne(
            m.orders,
            {order_id: req.params.id},
            {include: [
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
            } else {
                req.flash('danger', 'Permission Denied!')
                res.redirect('/stores/orders');
            }; 
        })
        .catch(err => fn.error(err, '/stores/orders', req, res));
    });
    //SHOW LINE
    app.get('/stores/order_lines/:id',    isLoggedIn, allowed('access_orders',      {allow: true}),             (req, res) => {
        fn.getOne(
            m.order_lines,
            {line_id: req.params.id},
        )
        .then(line => res.redirect('/stores/orders/' + line.order_id))
        .catch(err => fn.error(err, '/', req, res));
    });
    //ASYNC GET
    app.get('/stores/getorders',          isLoggedIn, allowed('access_orders',      {send: true}),              (req, res) => {
        fn.getAllWhere(
            m.orders,
            req.query,
            {include: [
                inc.users({as: '_for'}),
                inc.users({as: '_by'}),
                inc.order_lines()
        ]})
        .then(orders => res.send({result: true, orders: orders}))
        .catch(err => fn.send_error(err, res));
    });
    app.get('/stores/getorderlines',      isLoggedIn, allowed('access_order_lines', {send: true}),              (req, res) => {
        fn.getAllWhere(
            m.order_lines,
            req.query,
            {include: [
                inc.sizes(),
                inc.orders(),
                inc.demand_lines({as: 'demand_line', demands: true}),
                inc.receipt_lines({as: 'receipt_line', receipts: true}),
                inc.issue_lines({as: 'issue_line', issues: true})
        ]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => fn.send_error(err, res));
    });
    app.get('/stores/getorderlines/:id',  isLoggedIn, allowed('access_order_lines', {send: true}),              (req, res) => {
        fn.getAllWhere(
            m.order_lines,
            req.query,
            {include: [
                inc.sizes(),
                inc.orders({
                    where: {ordered_for: req.params.id},
                    required: true
        })]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => fn.send_error(err, res));
    });
    
    //POST
    app.post('/stores/orders',            isLoggedIn, allowed('order_add',          {send: true}),              (req, res) => {
        fn.createOrder({
            ordered_for: req.body.ordered_for,
            user_id: req.user.user_id
        })
        .then(order_id => {
            let message = 'Order raised: ';
            if (!result.created) message = 'There is already an order open for this user: ';
            res.send({result: true, message: message + order_id})
        })
        .catch(err => fn.send_error(err, res));
    });
    app.post('/stores/order_lines/:id',   isLoggedIn, allowed('order_line_add',     {send: true}),              (req, res) => {
        req.body.line.order_id = req.params.id;
        req.body.line.user_id  = req.user.user_id;
        fn.createOrderLine(req.body.line)
        .then(line_id => res.send({result: true, message: 'Item added: ' + line_id}))
        .catch(err => fn.send_error(err, res))
    });

    //BULK ADD ORDERS TO DEMANDS
    app.put('/stores/orders/addtodemand', isLoggedIn, allowed('demand_line_add',    {send: true}),              (req, res) => {
        fn.getOne(
            m.suppliers,
            {supplier_id: req.body.supplier_id}
        )
        .then(supplier => {
            if (supplier._raise_demand) {
                fn.getAllWhere(
                    m.order_lines,
                    {
                        _status: 'Open',
                        demand_line_id: null
                    },{
                        nullOK: true,
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
                            if (fn.promise_results(results)) {
                                res.send({result: true, message: order_lines.length + ' lines added to demand'});
                            } else fn.send_err(new Error('Some lines failed', res));
                        })
                        .catch(err => fn.send_error(err, res));
                    } else {
                        res.send({result: true, message: 'No order lines to demand'})
                    };
                })
                .catch(err => fn.send_error(err, res));
            } else {
                fn.send_error('Demands are not raised for this supplier', res);
            };
        })
        .catch(err => fn.send_error(err, res));
    });
    //COMPLETE
    app.put('/stores/orders/:id',         isLoggedIn, allowed('order_edit',         {allow: true, send: true}), (req, res) => {
        fn.getOne(
            m.orders,
            {order_id: req.params.id},
            {
                include: [inc.order_lines({where: {_status: {[op.not]: 'Cancelled'}}})],
                nullOK:  true
            }
        )
        .then(order => {
            if (!order.lines || order.lines.length === 0) {
                fn.send_error('An order must have at least one open line before you can complete it', res);
            } else if (order._complete) {
                fn.send_error('Order is already complete', res);
            } else if (!req.allowed && req.user.user_id !== order.ordered_for) {
                fn.send_error('Permission denied', res);
            } else {
                let actions = [];
                actions.push(
                    fn.update(
                        m.orders,
                        {_complete: 1},
                        {order_id: req.params.id}
                    )
                );
                actions.push(
                    fn.update(
                        m.order_lines,
                        {_status: 'Open'},
                        {order_id: req.params.id}
                    )
                );
                Promise.allSettled(actions)
                .then(result => {
                    if (fn.promise_results(result)) {
                        fn.createNote(
                            {
                                table:   'orders',
                                note:    'Completed',
                                id:      req.params.id,
                                user_id: req.user.user_id,
                                system: true
                            }
                        )
                        .then(note => res.send({result: true, message: 'Order completed'}))
                        .catch(err => fn.send_error(err, res));
                    } else fn.send_error('Some actions have failed', res, result)
                })
                .catch(err => fn.send_error(err, res));
            };
        })
        .catch(err => fn.send_error(err, res));
    });
    //ACTION LINES
    app.put('/stores/order_lines/:id',    isLoggedIn, allowed('order_edit',         {send: true}),              (req, res) => {
        fn.getOne(
            m.orders,
            {order_id: req.params.id}
        )
        .then(order => {
            let issues = fn.counter(), actions = [];
            for (let [lineID, line] of Object.entries(req.body.actions)) {
                line.line_id = Number(String(lineID).replace('line_id', ''));
                if (line._status === 'Demand') {
                    console.log(line);
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
                } 
                else if (line._status === 'Issue')   {
                    line.offset = issues();
                    actions.push(
                        issue_order_line(
                            line,
                            req.user.user_id
                        )
                    );
                } else if (line._status === 'Cancel') {
                    actions.push(
                        fn.update(
                            m.order_lines,
                            {_status: 'Cancelled'},
                            {line_id: line.line_id}
                        )
                    );
                    actions.push(
                        fn.createNote({
                            id:     order.order_id,
                            table:  'orders',
                            note:   'Line ' + line.line_id + ' cancelled',
                            user_id: req.user.user_id,
                            system:  true
                        })
                    );
                };
            };
            Promise.all(actions)
            .then(results => {
                fn.getAllWhere(
                    m.order_lines,
                    {
                        _status: 'Open',
                        order_id: order.order_id
                    }
                )
                .then(order_lines => {
                    if (order_lines && order_lines.length > 0) {
                        if (fn.promise_results(results)) res.send({result: true, message: 'Lines actioned'})
                        else fn.send_error('Some lines failed', res);
                    } else {
                        actions = [];
                        actions.push(
                            fn.update(
                                m.orders,
                                {_closed: 1},
                                {order_id: order.order_id}
                            )
                        );
                        actions.push(
                            fn.createNote({
                                table:  'orders',
                                note:    'Closed',
                                id:      order.order_id,
                                user_id: req.user.user_id,
                                system:  true
                            })
                        );
                        Promise.allSettled(actions)
                        .then(results2 => {
                            if (fn.promise_results(results)) res.send({result: true, message: 'Lines actioned, order closed'})
                            else fn.send_error('Some lines failed', res);
                        })
                        .catch(err => fn.send_error(err, res));
                    };
                })
                .catch(err => fn.send_error(err, res));
            })
            .catch(err => fn.send_error(err, res));
        })
        .catch(err => fn.send_error(err, res));
    });
    function demand_order_line (line_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.getOne(
                m.order_lines,
                {line_id: line_id},
                {include: [inc.sizes()]}
            )
            .then(order_line => {
                fn.createDemand(
                    {
                        supplier_id: order_line.size.supplier_id,
                        user_id:     user_id
                    }
                )
                .then(result => {
                    fn.createDemandLine({
                        demand_id: result.demand_id,
                        size_id:   order_line.size_id,
                        _qty:      order_line._qty,
                        user_id:   user_id
                    })
                    .then(demand_line_id => {
                        fn.update(
                            m.order_lines,
                            {demand_line_id: demand_line_id},
                            {line_id: line_id}
                        )
                        .then(result => resolve(demand_line_id))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function receive_order_line (line, user_id) {
        return new Promise((resolve, reject) => {
            fn.getOne(
                m.order_lines,
                {line_id: line.line_id},
                {include: [
                    inc.sizes(),
                    inc.orders()
            ]})
            .then(order_line => {
                fn.createReceipt(
                    {
                        supplier_id: order_line.size.supplier_id,
                        user_id:     user_id
                    }
                )
                .then(result => {
                    let line_id = line.line_id;
                    line.supplier_id = order_line.size.supplier_id;
                    line.receipt_id  = result.receipt_id;
                    line.size_id     = order_line.size_id;
                    line._qty        = order_line._qty;
                    line.user_id     = user_id;
                    delete line.line_id;
                    fn.createReceiptLine(line)
                    .then(receipt_line_id => {
                        let update_line = {receipt_line_id: receipt_line_id};
                        if (Number(order_line.order.ordered_for) === -1) {
                            update_line._status = 'Complete';
                            update_line.issue_line_id = -1;
                        };
                        if (!order_line.demand_line_id) update_line.demand_line_id = -1;
                        fn.update(
                            m.order_lines,
                            update_line,
                            {line_id: line_id}
                        )
                        .then(result => resolve(receipt_line_id))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function issue_order_line (line, user_id) {
        return new Promise((resolve, reject) => {
            fn.getOne(
                m.order_lines,
                {line_id: line.line_id},
                {include: [inc.orders()]}
            )
            .then(order_line => {
                if (Number(order_line.order.ordered_for) !== -1) {
                    fn.createIssue({
                        issued_to: order_line.order.ordered_for,
                        _date_due: fn.addYears(7),
                        user_id:   user_id
                    })
                    .then(result => {
                        fn.getAllWhere(
                            m.issue_lines,
                            {issue_id: result.issue_id},
                            {nullOK: true}
                        )
                        .then(issue_lines => {
                            let line_id = line.line_id;
                            line.issue_id = result.issue_id;
                            line.user_id  = user_id;
                            line.size_id  = order_line.size_id;
                            line._line    = line.offset + issue_lines.length
                            line._qty     = order_line._qty;
                            delete line.line_id
                            fn.createIssueLine(line)
                            .then(issue_line_id => {
                                let update_line = {
                                    issue_line_id: issue_line_id,
                                    _status: 'Complete'
                                };
                                if (!order_line.demand_line_id) update_line.demand_line_id = -1;
                                if (!order_line.receipt_line_id) update_line.receipt_line_id = -1;
                                fn.update(
                                    m.order_lines,
                                    update_line,
                                    {line_id: line_id}
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

    //DELETE
    app.delete('/stores/orders/:id',      isLoggedIn, allowed('order_delete',       {send: true}),              (req, res) => {
        if (req.query.user) {
            fn.delete(
                'orders',
                {order_id: req.params.id},
                {hasLines: true}
            )
            .then(result => {
                req.flash(result.success, result.message);
                res.redirect('/stores/orders');
            })
            .catch(err => fn.error(err, '/stores/issues', req, res));
        };
    });
};
