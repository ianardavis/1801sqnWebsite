const op = require('sequelize').Op;
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //INDEX
    app.get('/stores/orders', isLoggedIn, allowed('access_orders'), (req, res) => {
        let where = {}, query = {};
        query.complete = req.query.complete || 2;
        if      (Number(query.complete) === 2) where._complete = 0
        else if (Number(query.complete) === 3) where._complete = 1;
        fn.getAllWhere(
            m.orders,
            where,
            {
                include: [
                    inc.users({as: '_for'}),
                    inc.users({as: '_by'}),
                    inc.order_lines()
                ]
            }
        )
        .then(orders => {
            fn.getAllWhere(
                m.suppliers,
                {supplier_id: {[op.not]: 3}}
            )
            .then(suppliers => {
                res.render('stores/orders/index',{
                    orders:    orders,
                    query:     query,
                    suppliers: suppliers,
                    download:  req.query.download || null
                });
            })
            .catch(err => fn.error(err, '/stores', req, res));
        })
        .catch(err => fn.error(err, '/stores', req, res));
    });
    //NEW
    app.get('/stores/orders/new', isLoggedIn, allowed('order_add'), (req, res) => {
        let user = Number(req.query.user);
        if (!user) user = -1
        if (user !== -1) {
            fn.getOne(
                m.users,
                {user_id: user},
                {include: [m.ranks]}
            )
            .then(user => {
                if (user !== req.user.user_id) {
                    if (user.status_id === 1 || user.status_id === 2) res.render('stores/orders/new', {user: user}); 
                    else {
                        req.flash('danger', 'Orders can only be made for current users')
                        res.redirect('/stores/users/' + user);
                    };
                } else {
                    req.flash('info', 'You can not order for yourself, make a request instead');
                    res.redirect('/stores/users/' + user);
                };
            })
            .catch(err => fn.error(err, '/stores/users', req, res));
        } else res.render('stores/orders/new', {user: {user_id: -1}});
    });
    //SHOW
    app.get('/stores/orders/:id', isLoggedIn, allowed('access_orders'), (req, res) => {
        fn.getOne(
            m.orders,
            {order_id: req.params.id},
            {include: [
                inc.users({as: '_for'}),
                inc.users({as: '_by'}),
                inc.order_lines({include: [
                    inc.demand_lines({as: 'demand_line', demands: true}),
                    inc.receipt_lines({as: 'receipt_line', receipts: true}),
                    inc.issue_lines({as: 'issue_line', issues: true}),
                    inc.sizes()
                ]})
            ]}
        )
        .then(order => {
            if (req.allowed || order.orderedFor.user_id === req.user.user_id) {
                fn.getNotes('orders', req.params.id, req)
                .then(notes => {
                    res.render('stores/orders/show',{
                        order: order,
                        notes: notes,
                        query: {system: Number(req.query.system) || 2},
                        show_tab: req.query.tab || 'details'
                    });
                });
            } else {
                req.flash('danger', 'Permission Denied!')
                res.redirect('/stores/orders');
            }; 
        })
        .catch(err => fn.error(err, '/stores/orders', req, res));
    });
    
    //POST
    app.post('/stores/orders', isLoggedIn, allowed('order_add', {send: true}), (req, res) => {
        if (req.body.selected) {
            fn.createOrder(
                req.body.ordered_for,
                req.body.selected,
                req.user.user_id
            )
            .then(order_id => {
                req.flash('success', 'Order created: ' + order_id);
                if (Number(req.body.ordered_for) === -1) res.redirect('/stores/orders/' + order_id)
                else res.redirect('/stores/users/' + req.body.ordered_for);
            })
            .catch(err => redirect(err, req, res));
        } else redirect(new Error('No items selected'), req, res);
    });
    function redirect(err, req, res) {
        if (Number(req.body.ordered_for) === -1) fn.error(err, '/stores/orders', req, res) 
        else fn.error(err, '/stores/users/' + req.body.ordered_for, req, res);
    };

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
    app.put('/stores/orders/:id/close', isLoggedIn, allowed('order_edit', {send: true}), (req, res) => {
        let actions = [];
        actions.push(
            fn.update(
                m.order_lines,
                {_status: 'Cancelled'},
                {
                    order_id: req.params.id,
                    _status: 'Open'
                }
            )
        );
        actions.push(
            fn.create(
                m.notes,
                {
                    _table:  'orders',
                    _id:     req.params.id,
                    _note:   'Order closed',
                    _system: true,
                    _date:   Date.now(),
                    user_id: req.user.user_id
                }
            )
        )
        Promise.allSettled(actions)
        .then(result => {
            fn.closeOrder(req.params.id, req.user.user_id)
            .then(close_result => {
                if (close_result.closed) req.flash('success', 'Order closed')
                else req.flash('danger', 'Order NOT closed')
                res.redirect('/stores/orders/' + req.params.id);
            })
            .catch(err => fn.error(err, '/stores/orders/' + req.params.id, req, res));
            req.flash('success', 'Order closed');
            res.redirect('/stores/orders/' + req.params.id);
        })
        .catch(err => fn.error(err, '/stores/orders/' + req.params.id, req, res));
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
