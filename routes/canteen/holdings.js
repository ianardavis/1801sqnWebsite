module.exports = (app, m, fn) => {
    app.get('/holdings',            fn.loggedIn(), fn.permissions.get('access_holdings'),    (req, res) => res.render('canteen/holdings/index'));
    app.get('/holdings/:id',        fn.loggedIn(), fn.permissions.get('access_holdings'),    (req, res) => res.render('canteen/holdings/show'));
    
    app.get('/get/holdings',        fn.loggedIn(), fn.permissions.check('access_holdings'),  (req, res) => {
        m.holdings.findAll({where: req.query})
        .then(holdings => res.send({success: true, result: holdings}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/holding',         fn.loggedIn(), fn.permissions.check('access_holdings'),  (req, res) => {
        fn.get(
            'holdings',
            req.query
        )
        .then(holding => res.send({success: true, result: holding}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/holdings_except', fn.loggedIn(), fn.permissions.check('access_movements'), (req, res) => {
        m.holdings.findAll({where: {holding_id: {[fn.op.ne]: req.query.holding_id}}})
        .then(movements => res.send({success: true, result: movements}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/holdings',           fn.loggedIn(), fn.permissions.check('holding_add'),      (req, res) => {
        if (!req.body.holding) fn.send_error(res, 'No details')
        else {
            fn.holdingd.create(req.body.holding)
            .then(result => res.send({success: true, message: 'Holding created'}))
            .catch(err => fn.send_error(res, err));
        };
    });
};