module.exports = (app, m, fn) => {
    app.get('/demands',              fn.loggedIn(), fn.permissions.get(  'authorised_demander'), (req, res) => res.render('stores/demands/index'));
    app.get('/demands/:id',          fn.loggedIn(), fn.permissions.get(  'authorised_demander'), (req, res) => res.render('stores/demands/show'));
    app.get('/demands/:id/download', fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => fn.demands.download(req, res));
    app.get('/demand_lines/:id',     fn.loggedIn(), fn.permissions.get(  'authorised_demander'), (req, res) => res.render('stores/demand_lines/show'));
    
    app.get('/count/demands',        fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        m.demands.count({where: req.query.where})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/count/demand_lines',   fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        m.demand_lines.count({where: req.query.where})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/sum/demand_lines',     fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        m.demand_lines.sum('qty', {where: req.query.where})
        .then(sum => res.send({success: true, result: sum}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.get('/get/demand',           fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.get(
            req.query.where,
            [
                fn.inc.users.user(),
                fn.inc.stores.supplier()
            ]
        )
        .then(demand => res.send({success: true, result: demand}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/demands',          fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.getAll(
            fn.build_query(req.query),
            fn.pagination(req.query)
        )
        .then(results => fn.send_res('demands', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/demand_lines',     fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        m.demand_lines.findAndCountAll({
            where: req.query.where,
            include: [
                fn.inc.stores.size(),
                fn.inc.users.user(),
                fn.inc.stores.demand(),
                m.orders
            ],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('lines', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/demand_line',      fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.lines.get(
            req.query.where,
            [
                fn.inc.users.user(),
                m.orders
            ]
        )
        .then(line => res.send({success: true, result: line}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/sizes/:id/demand',    fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.lines.create_bulk(
            req.body.lines,
            req.body.demand_id,
            req.user.user_id
        )
        .then(result => res.send({success: true, message: `Line(s) created`}))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/demands',             fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.create(
            req.body.supplier_id,
            req.user.user_id
        )
        .then(demand => res.send({success: true, message: (demand.created ? 'There is already a demand open for this supplier' : 'Demand raised')}))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/demands/:id/complete', fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.complete(
            req.params.id,
            req.user
        )
        .then(message => res.send({success: true, message: `Demand completed. ${message}`}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/demands/:id/close',    fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.close(
            req.params.id,
            req.user.user_id
        )
        .then(result => res.send({success: true, message: 'Demand closed'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/demand_lines',         fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.lines.update(req.body.lines, req.user.user_id)
        .then(results => res.send({success: true, message: 'Lines actioned'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/demands/:id',       fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.cancel(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Demand Cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/demand_lines/:id',  fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.lines.cancel(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Line cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
};