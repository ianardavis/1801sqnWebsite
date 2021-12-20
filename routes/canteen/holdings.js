module.exports = (app, m, fn) => {
    app.get('/holdings',            fn.loggedIn(), fn.permissions.get('cash_admin'),   (req, res) => res.render('canteen/holdings/index'));
    app.get('/holdings/:id',        fn.loggedIn(), fn.permissions.get('cash_admin'),   (req, res) => res.render('canteen/holdings/show'));
    
    app.get('/get/holdings',        fn.loggedIn(), fn.permissions.check('cash_admin'), (req, res) => {
        m.holdings.findAndCountAll({
            where: req.query.where,
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('holdings', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/holding',         fn.loggedIn(), fn.permissions.check('cash_admin'), (req, res) => {
        fn.get(
            'holdings',
            req.query.where
        )
        .then(holding => res.send({success: true, result: holding}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/holdings_except', fn.loggedIn(), fn.permissions.check('cash_admin'), (req, res) => {
        m.holdings.findAndCountAll({
            where: {holding_id: {[fn.op.ne]: req.query.holding_id}},
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('holdings', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/holdings',           fn.loggedIn(), fn.permissions.check('cash_admin'), (req, res) => {
        fn.holdings.create(req.body.holding, req.user.user_id)
        .then(result => res.send({success: true, message: 'Holding created'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/holdings_count/:id',  fn.loggedIn(), fn.permissions.check('cash_admin'), (req, res) => {
        fn.holdings.count(
            req.params.id,
            req.body.balance,
            req.user.user_id
        )
        .then(result => res.send({success: true, message: 'Holding Counted'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/holdings/:id',        fn.loggedIn(), fn.permissions.check('cash_admin'), (req, res) => {
        fn.put(
            'holdings',
            {holding_id: req.params.id},
            req.body.holding
        )
        .then(result => res.send({success: true, message: 'Holding saved'}))
        .catch(err => fn.send_error(res, err));
    });
};