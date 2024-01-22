module.exports = (app, fn) => {
    app.get('/orders',          fn.loggedIn, fn.permissions.get('stores_stock_admin'),   (req, res) => res.render('stores/orders/index'));
    app.get('/orders/:id',      fn.loggedIn, fn.permissions.get('stores_stock_admin'),   (req, res) => res.render('stores/orders/show'));
    
    app.get('/count/orders',    fn.loggedIn, fn.permissions.check('stores_stock_admin'), (req, res) => {
        req.query.where.site_id = req.session.site.site_id;
        fn.orders.count(req.query.where)
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/sum/orders',      fn.loggedIn, fn.permissions.check('stores_stock_admin'), (req, res) => {
        req.query.where.site_id = req.session.site.site_id;
        fn.orders.sum(req.query.where)
        .then(sum => res.send({success: true, result: sum}))
        .catch(err => fn.sendError(res, err));
    });

    app.get('/get/orders',      fn.loggedIn, fn.permissions.check('stores_stock_admin'), (req, res) => {
        if (!req.query.where) req.query.where = {};
        req.query.where.site_id = req.session.site.site_id;
        fn.orders.findAll(req.query)
        .then(results => fn.sendRes('orders', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/order',       fn.loggedIn, fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.orders.find(
            {
                ...req.query.where,
                site_id: req.session.site.site_id
            },
            [
                fn.inc.users.user(),
                fn.inc.stores.demand_lines('demand_lines'),
            ]
        )
        .then(order => res.send({success: true, result: order}))
        .catch(err => fn.sendError(res, err));
    });

    app.post('/orders',         fn.loggedIn, fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.orders.createBulk(req.session.site.site_id, req.body.orders.filter(e => e.qty), req.user.user_id)
        .then(result => res.send({success: true, message: 'Orders placed'}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.put('/orders',          fn.loggedIn, fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.orders.update(req.session.site.site_id, req.body.lines, req.user.user_id)
        .then(message => res.send({success: true, message: message}))
        .catch(err => fn.sendError(res, err));
    });

    app.put('/orders/:id/qty',  fn.loggedIn, fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.orders.changeQty(req.session.site.site_id, req.params.id, req.body.qty , req.user.user_id)
        .then(result => res.send({success: true, message: 'Quantity updated'}))
        .catch(err => fn.sendError(res, err));
    });
    app.put('/orders/:id/size', fn.loggedIn, fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.orders.changeSize(req.session.site.site_id, req.params.id, req.body.size_id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Size updated'}))
        .catch(err => fn.sendError(res, err));
    });
    app.put('/orders/:id/mark', fn.loggedIn, fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.orders.markAs(req.session.site.site_id, req.params.id, req.body.order.status, req.user.user_id)
        .then(message => res.send({success: true, message: message}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.delete('/orders/:id',   fn.loggedIn, fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.orders.cancel(req.session.site.site_id, req.params.id, req.user.user_id)
        .then(result => res.send({success: true,  message: 'Order cancelled'}))
        .catch(err => fn.sendError(res, err));
    });
};