const op = require('sequelize').Op;
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //INDEX
    app.get('/stores/orders',            isLoggedIn, allowed('access_orders'),                                 (req, res) => {
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
    app.get('/stores/orders/:id',        isLoggedIn, allowed('access_orders'),                                 (req, res) => {
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
    app.get('/stores/order_lines/:id',   isLoggedIn, allowed('access_orders',      {allow: true}),             (req, res) => {
        fn.getOne(
            m.order_lines,
            {line_id: req.params.id},
        )
        .then(line => res.redirect('/stores/orders/' + line.order_id))
        .catch(err => fn.error(err, '/', req, res));
    });
    //ASYNC GET
    app.get('/stores/getorders',         isLoggedIn, allowed('access_orders',      {send: true}),              (req, res) => {
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
    app.get('/stores/getorderlines',     isLoggedIn, allowed('access_order_lines', {send: true}),              (req, res) => {
        fn.getAllWhere(
            m.order_lines,
            req.query,
            {include: [
                inc.sizes(),
                inc.orders()
        ]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => fn.send_error(err, res));
    });
    app.get('/stores/getorderlines/:id', isLoggedIn, allowed('access_order_lines', {send: true}),              (req, res) => {
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
    app.post('/stores/orders',           isLoggedIn, allowed('order_add',          {send: true}),              (req, res) => {
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
    app.post('/stores/order_lines/:id',  isLoggedIn, allowed('order_line_add',     {send: true}),              (req, res) => {
        req.body.line.order_id = req.params.id;
        req.body.line.user_id  = req.user.user_id;
        fn.createOrderLine(req.body.line)
        .then(line_id => res.send({result: true, message: 'Item added: ' + line_id}))
        .catch(err => fn.send_error(err, res))
    });

    //PUT
    app.put('/stores/order_lines/:id',   isLoggedIn, allowed('order_edit',         {send: true}),              (req, res) => {
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
    //COMPLETE
    app.put('/stores/orders/:id',        isLoggedIn, allowed('order_edit',         {allow: true, send: true}), (req, res) => {
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

    //DELETE
    app.delete('/stores/orders/:id',     isLoggedIn, allowed('order_delete',       {send: true}),              (req, res) => {
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
