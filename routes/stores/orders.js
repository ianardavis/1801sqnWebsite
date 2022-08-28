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
        m.orders.findOne({
            where: req.query.where,
            include: [
                fn.inc.stores.size(),
                fn.inc.users.user()
            ]
        })
        .then(order => {
            if (order) res.send({success: true, result: order})
            else res.send({success: false, message: 'Order not found'});
        })
        .catch(err => fn.send_error(res, err));
    });

    app.post('/orders',                 fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.orders.createBulk(req.body.orders.filter(e => e.qty), req.user.user_id)
        .then(result => res.send({success: true, message: 'Orders placed'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.put('/orders',                  fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {5
        if (!req.body.lines || req.body.lines.filter(e => e.status !== '').length === 0) fn.send_error(res, 'No actions')
        else {
            let actions = [];
            req.body.lines.filter(e => e.status === '-3').forEach(order => {
                actions.push(fn.orders.restore(order.order_id, req.user.user_id));
            })
            req.body.lines.filter(e => e.status === '0').forEach(order => {
                actions.push(fn.orders.cancel( order.order_id, req.user.user_id));
            });
            req.body.lines.filter(e => e.status === '3').forEach(order => {
                actions.push(fn.orders.receive(order.order_id, order, req.user.user_id));
            });
            if (req.body.lines.filter(e => e.status === '2').length > 0) {
                actions.push(
                    fn.orders.demand(req.body.lines.filter(e => e.status === '2'), req.user.user_id)
                );
            };
            if (actions.length > 0) {
                Promise.allSettled(actions)
                .then(results => res.send({success: true, message: (fn.allSettledResults(results) ? 'Lines actioned' : 'Some lines failed')}))
                .catch(err => fn.send_error(res, err));
            } else res.send({success: true, message: 'No actions to perform'});
        };
    });
    app.put('/orders/:id/qty',          fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.orders.change_qty(req.params.id, req.body.qty , req.user.user_id)
        .then(result => res.send({success: true, message: 'Quantity updated'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/orders/:id/size',         fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.orders.change_size(req.params.id, req.body.size_id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Size updated'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/orders/:id/mark/:status', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.orders.get(req.params.id)
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
                    .then(result => res.send({success: true, message: `Order marked as ${status.toLowerCase()}`}));
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
        fn.orders.cancel(req.params.id, req.user.user_id)
        .then(result => res.send({success: true,  message: 'Order cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
};