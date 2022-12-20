module.exports = (app, m, fn) => {
    app.get('/orders',          fn.loggedIn(), fn.permissions.get('stores_stock_admin'),   (req, res) => res.render('stores/orders/index'));
    app.get('/orders/:id',      fn.loggedIn(), fn.permissions.get('stores_stock_admin'),   (req, res) => res.render('stores/orders/show'));
    
    app.get('/count/orders',    fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.orders.count({where: req.query.where})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/sum/orders',      fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.orders.sum('qty', {where: req.query.where})
        .then(sum => res.send({success: true, result: sum}))
        .catch(err => fn.send_error(res, err));
    });

    app.get('/get/orders',      fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
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
    app.get('/get/order',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.orders.findOne({
            where: req.query.where,
            include: [
                fn.inc.stores.size(),
                fn.inc.users.user(),
                m.demand_lines,
                {
                    model: m.issues,
                    include: [fn.inc.users.user({as: 'user_issue'})]
                }
            ]
        })
        .then(order => {
            if (order) {
                res.send({success: true, result: order});
                
            } else {
                res.send({success: false, message: 'Order not found'});
                
            };
        })
        .catch(err => fn.send_error(res, err));
    });

    app.post('/orders',         fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.orders.createBulk(req.body.orders.filter(e => e.qty), req.user.user_id)
        .then(result => res.send({success: true, message: 'Orders placed'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.put('/orders',          fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.check_for_valid_lines_to_update(req.body.lines)
        .then(([orders, submitted]) => {
            let actions = [];
            orders.filter(e => e.status === '-3').forEach(order => {
                actions.push(fn.orders.restore(order.order_id, req.user.user_id));
            })

            orders.filter(e => e.status === '0').forEach(order => {
                actions.push(fn.orders.cancel( order.order_id, req.user.user_id));
            });

            orders.filter(e => e.status === '3').forEach(order => {
                actions.push(fn.orders.receive(order.order_id, order, req.user.user_id));
            });

            const to_demand = orders.filter(e => e.status === '2');
            if (to_demand.length > 0) {
                actions.push(fn.orders.demand(to_demand, req.user.user_id));
            };

            if (actions.length > 0) {
                Promise.allSettled(actions)
                .then(results => {
                    const resolved = results.filter(e => e.status ==='fulfilled').length;
                    const message = `${resolved} of ${submitted} tasks completed`;
                    res.send({success: true, message: message})
                })
                .catch(err => fn.send_error(res, err));

            } else {
                res.send({success: true, message: 'No actions to perform'});

            };
        })
        .catch(err => fn.send_error(res, err));
    });

    app.put('/orders/:id/qty',  fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.orders.change_qty(req.params.id, req.body.qty , req.user.user_id)
        .then(result => res.send({success: true, message: 'Quantity updated'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/orders/:id/size', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.orders.change_size(req.params.id, req.body.size_id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Size updated'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/orders/:id/mark', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.orders.mark_as(req.params.id, req.body.order.status, req.user.user_id)
        .then(message => res.send({success: true, message: message}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/orders/:id',   fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.orders.cancel(req.params.id, req.user.user_id)
        .then(result => res.send({success: true,  message: 'Order cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
};