const op = require('sequelize').Op;
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //INDEX
    app.get('/stores/orders', isLoggedIn, allowed('access_orders'), (req, res) => {
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
    app.get('/stores/orders/:id', isLoggedIn, allowed('access_orders'), (req, res) => {
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
    app.get('/stores/order_lines/:id', isLoggedIn, allowed('access_orders', {allow: true}), (req, res) => {
        fn.getOne(
            m.order_lines,
            {line_id: req.params.id},
        )
        .then(line => res.redirect('/stores/orders/' + line.order_id))
        .catch(err => fn.error(err, '/', req, res));
    });
    //ASYNC GET
    app.get('/stores/getorders', isLoggedIn, allowed('access_orders', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.orders,
            req.query,
            {include: [
                inc.users({as: '_for'}),
                inc.users({as: '_by'}),
                inc.order_lines()
        ]})
        .then(orders => res.send({result: true, orders: orders}))
        .catch(err => fn.send_error(err.message, res));
    });
    //ASYNC GET
    app.get('/stores/getorderlines', isLoggedIn, allowed('access_order_lines', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.order_lines,
            req.query,
            {include: [
                inc.sizes(),
                inc.orders()
        ]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => fn.send_error(err.message, res));
    });
    //ASYNC GET
    app.get('/stores/getorderlinesbyuser/:id', isLoggedIn, allowed('access_order_lines', {send: true}), (req, res) => {
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
        .catch(err => fn.send_error(err.message, res));
    });
    
    //POST
    app.post('/stores/orders', isLoggedIn, allowed('order_add', {send: true}), (req, res) => {
        fn.createOrder({
            ordered_for: req.body.ordered_for,
            user_id: req.user.user_id
        })
        .then(order_id => {
            let message = 'Order raised: ';
            if (!result.created) message = 'There is already an order open for this user: ';
            res.send({result: true, message: message + order_id})
        })
        .catch(err => fn.send_error(err.message, res));
    });
    app.post('/stores/order_lines/:id', isLoggedIn, allowed('order_line_add', {send: true}), (req, res) => {
        req.body.line.order_id = req.params.id;
        req.body.line.user_id  = req.user.user_id;
        fn.createOrderLine(req.body.line)
        .then(line_id => res.send({result: true, message: 'Item added: ' + line_id}))
        .catch(err => fn.send_error(err.message, res))
    });

    //PUT
    app.put('/stores/orders/:id', isLoggedIn, allowed('order_edit', {send: true}), (req, res) => {
        if (req.body.selected) {
            if (req.body.action === 'demand') {
                fn.demand_order_lines(
                    req.body.selected,
                    req.user.user_id
                )
                .then(results => {
                    req.flash('success', 'Demand(s) raised');
                    res.redirect('/stores/orders/' + req.params.id);
                })
                .catch(err => fn.error(err, '/stores/orders/' + req.params.id, req, res));

            } else if (req.body.action === 'receive') {
                fn.receive_order_lines(req.body.selected)
                .then(results => res.render('stores/receipts/new', results))
                .catch(err => fn.error(err, '/stores/orders/' + req.params.id, req, res));

            } else if (req.body.action === 'issue') {
                fn.issue_order_lines(req.body.selected)
                .then(results => res.render('stores/issues/new', results))
                .catch(err => fn.error(err, '/stores/orders/' + req.params.id, req, res));

            } else if (req.body.action === 'cancel') {
                fn.cancel_order_lines(
                    req.body.selected,
                    req.params.id,
                    req.user.user_id
                )
                .then(results => {
                    req.flash('success', 'Lines cancelled');
                    res.redirect('/stores/orders/' + req.params.id);
                })
                .catch(err => fn.error(err, '/stores/orders/' + req.params.id, req, res));

            } else {
                req.flash('danger', 'Invalid request');
                res.redirect('/stores/orders/' + req.params.id);
            };
        } else {
            req.flash('info', 'No lines selected');
            res.redirect('/stores/orders/' + req.params.id);
        };
    });
    //CLOSE
    app.put('/stores/orders/:id/complete', isLoggedIn, allowed('order_edit', {allow: true, send: true}), (req, res) => {
        fn.getOne(m.orders, {order_id: req.params.id})
        .then(order => {
            if (allowed || Number(order.ordered_for) === req.user.user_id) {
                fn.getAllWhere(
                    m.order_lines,
                    {order_id: order.order_id},
                    {nullOK: true}
                )
                .then(lines => {
                    if (lines) {
                        fn.update(
                            m.orders,
                            {_complete: 1},
                            {order_id: order.order_id}
                        )
                        .then(result => {
                            fn.create(
                                m.notes,
                                {
                                    _table:  'orders',
                                    _id:     order.order_id,
                                    _note:   'Order complete',
                                    _system: true,
                                    user_id: req.user.user_id
                                }
                            )
                            .then(note => res.send({result: true, message: 'Order marked complete'}))
                            .catch(err => fn.send_error(err.message, res));
                        })
                        .catch(err => fn.send_error(err.message, res));
                    } else fn.send_error('An order must have at least 1 line before you can complete it', res);
                })
                .catch(err => fn.send_error(err.message, res));
            } else fn.send_error('Permission denied', res);
        })
        .catch(err => fn.send_error(err.message, res));
    });

    //DELETE
    app.delete('/stores/orders/:id', isLoggedIn, allowed('order_delete', {send: true}), (req, res) => {
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
