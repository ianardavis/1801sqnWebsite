module.exports = (app, fn) => {
    app.get('/demands',              fn.loggedIn(), fn.permissions.get(  'authorised_demander'), (req, res) => res.render('stores/demands/index'));
    app.get('/demands/:id',          fn.loggedIn(), fn.permissions.get(  'authorised_demander'), (req, res) => res.render('stores/demands/show'));
    app.get('/demands/:id/download', fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => fn.demands.download(req, res));
    app.get('/demand_lines/:id',     fn.loggedIn(), fn.permissions.get(  'authorised_demander'), (req, res) => res.render('stores/demand_lines/show'));
    
    app.get('/count/demands',        fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.count(req.query.where)
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/count/demand_lines',   fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.lines.count(req.query.where)
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/sum/demand_lines',     fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.lines.sum('qty', req.query.where)
        .then(sum => res.send({success: true, result: sum}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.get('/get/demand',           fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.find(
            req.query.where,
            [
                fn.inc.users.user(),
                fn.inc.stores.supplier()
            ]
        )
        .then(demand => res.send({success: true, result: demand}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/demand/users',     fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.findUsers(req.query.where.demand_id)
        .then(users => res.send({success: true, result: users}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/demands',          fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.findAll({
            where: fn.buildQuery(req.query)
        })
        .then(results => fn.sendRes('demands', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/demand_lines',     fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.lines.findAndCountAll(
            req.query.where,
            fn.pagination(req.query)
        )
        .then(results => fn.sendRes('lines', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/demand_line',      fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.lines.find(
            req.query.where,
            [
                fn.inc.users.user(),
                fn.inc.stores.orders()
            ]
        )
        .then(line => res.send({success: true, result: line}))
        .catch(err => fn.sendError(res, err));
    });

    app.post('/sizes/:id/demand',    fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.lines.createBulk(
            req.body.lines,
            req.body.demand_id,
            req.user.user_id
        )
        .then(result => res.send({success: true, message: `Line(s) created`}))
        .catch(err => fn.sendError(res, err));
    });
    app.post('/demands',             fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.create(
            req.body.supplier_id,
            req.user.user_id
        )
        .then(([demand]) => res.send({success: true, message: 'Demand raised'}))
        .catch(err => fn.sendError(res, err));
    });

    app.put('/demands/:id/complete', fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.complete(
            req.params.id,
            req.user
        )
        .then(message => res.send({success: true, message: `Demand completed. ${message}`}))
        .catch(err => fn.sendError(res, err));
    });
    app.put('/demands/:id/close',    fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.close(
            req.params.id,
            req.user.user_id
        )
        .then(result => res.send({success: true, message: 'Demand closed'}))
        .catch(err => fn.sendError(res, err));
    });
    app.put('/demand_lines',         fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.lines.update(req.body.lines, req.user.user_id)
        .then(results => res.send({success: true, message: 'Lines actioned'}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.delete('/demands/:id',       fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.cancel(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Demand Cancelled'}))
        .catch(err => fn.sendError(res, err));
    });
    app.delete('/demand_lines/:id',  fn.loggedIn(), fn.permissions.check('authorised_demander'), (req, res) => {
        fn.demands.lines.cancel(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Line cancelled'}))
        .catch(err => fn.sendError(res, err));
    });
};