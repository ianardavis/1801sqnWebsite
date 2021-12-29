module.exports = (app, m, fn) => {
    let receipts = {}, issues = {};
    app.get('/orders',                  fn.loggedIn(), fn.permissions.get('stores_stock_admin'),   (req, res) => res.render('stores/orders/index'));
    app.get('/orders/:id',              fn.loggedIn(), fn.permissions.get('stores_stock_admin'),   (req, res) => res.render('stores/orders/show'));
    
    app.get('/count/orders',            fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.orders.count({where: req.query.where})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/sum/orders',              fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.orders.sum('qty', {where: req.query.where})
        .then(sum => res.send({success: true, result: sum}))
        .catch(err => fn.send_error(res, err));
    });

    app.get('/get/orders',              fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.orders.findAndCountAll({
            where: req.query.where,
            include: [
                fn.inc.stores.size(),
                fn.inc.users.user()
            ],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('orders', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/order',               fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.get(
            'orders',
            req.query.where,
            [
                fn.inc.stores.size(),
                fn.inc.users.user()
            ]
        )
        .then(order => res.send({success: true, result: order}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/orders',                 fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.orders.createBulk(req.body.orders.filter(e => e.qty), req.user.user_id)
        .then(result => res.send({success: true, message: 'Orders placed'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.put('/orders',                  fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {5
        let actions = [],
            demands = req.body.lines.filter(e => e.status === '2');
        req.body.lines.filter(e => e.status === '-1').forEach(order => {
            actions.push(
                fn.orders.restore({
                    order_id: order.order_id,
                    user_id:  req.user.user_id
                })
            );
        })
        req.body.lines.filter(e => e.status === '0').forEach(order => {
            actions.push(
                fn.orders.cancel({
                    order_id: order.order_id,
                    user_id:  req.user.user_id
                })
            );
        });
        req.body.lines.filter(e => e.status === '3').forEach(order => {
            actions.push(
                fn.orders.receive({
                    order_id: order.order_id,
                    user_id:  req.user.user_id
                })
            );
        });
        if (demands && demands.length > 0) actions.push(fn.orders.demand(demands, req.user.user_id));
        Promise.allSettled(actions)
        .then(results => {
            if (results.filter(e => e.status === 'rejected').length > 0) {
                console.log(results);
                res.send({success: true, message: 'Some lines failed'});
            } else res.send({success: true, message: 'Lines actioned'});
        })
        .catch(err => fn.send_error(res, err));
    });
    app.put('/orders/:id/mark/:status', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.get(
            'orders',
            {order_id: req.params.id}
        )
        .then(order => {
            if (['0', '1', '2', '3'].includes(req.params.status)) {
                order.update({status: req.params.status})
                .then(result => {
                    let status;
                    switch (req.params.status) {
                        case '0':
                            status = 'CANCELLED'
                            break;
                        case '1':
                            status = 'PLACED'
                            break;
                        case '2':
                            status = 'DEMANDED'
                            break;
                        case '3':
                            status = 'RECEIVED'
                            break;
                    };
                    fn.actions.create(
                        `ORDER | ${status} | Set manually`,
                        req.user.user_id,
                        [{table: 'orders', id: order.order_id}]
                    )
                    .then(result => res.send({success: true, message: `Order marked as ${status.toLowerCase()}`}))
                    .catch(err => {
                        console.log(err);
                        res.send({success: true, message: `Order marked as ${status.toLowerCase()}`});
                    });
                })
                .catch(err => {
                    console.log(err);
                    fn.send_error(res, err);
                });
            } else fn.send_error(res, new Error('Invalid status'));
        })
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/orders/:id',           fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.get(
            'orders',
            {order_id: req.params.id}
        )
        .then(order => {
            if (order.status !== 1) fn.send_error(res, 'Only placed orders can be cancelled');
            else {
                fn.update(order, {status: 0})
                .then(results => {
                    m.actions.findAll({
                        where:      {order_id: order_id},
                        attributes: ['action_id'],
                        include: [fn.inc.stores.issue()]
                    })
                    .then(issues => {
                        let issue_actions = [];
                        issues.forEach(issue => {
                            if (issue.issue.status === 3) {
                                issue_actions.push(fn.update(issue.issue, {status: 2}));
                                issue_actions.push(fn.actions.create(
                                    'ORDER | CANCELLED',
                                    req.user.user_id,
                                    [
                                        {table: 'issues', id: issue.issue_id},
                                        {table: 'orders', id: order.order_id}
                                    ]
                                ));
                            };
                        });
                        Promise.allSettled(issue_actions)
                        .then(results => {
                            if (results.filter(e => e.status === 'rejected').length > 0) res.send({success: true,  message: 'Order cancelled, some issue actions have failed'})
                            else                                                         res.send({success: true,  message: 'Order cancelled'});
                        })
                        .catch(err => fn.send_error(res, err));
                    })
                    .catch(err => fn.send_error(res, err));
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
};