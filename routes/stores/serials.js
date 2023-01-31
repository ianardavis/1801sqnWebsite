module.exports = (app, m, fn) => {
    app.get('/serials/:id',          fn.loggedIn(), fn.permissions.get(  'access_stores'),      (req, res) => res.render('stores/serials/show'));
    app.get('/get/serials',          fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        m.serials.findAndCountAll({
            where:   req.query.where,
            include: [
                fn.inc.stores.location(),
                fn.inc.stores.issue(),
                fn.inc.stores.size()
            ],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('serials', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/current_serials',  fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        if (!req.query.where) req.query.where = {};
        req.query.where.location_id = {[fn.op.not]: null};
        req.query.where.issue_id    = null;
        m.serials.findAndCountAll({
            where:   req.query.where,
            include: [
                fn.inc.stores.location(),
                fn.inc.stores.issue(),
                fn.inc.stores.size()
            ],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('serials', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/serial',           fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        m.serials.findOne({
            where: req.query.where,
            include: [
                fn.inc.stores.location(),
                fn.inc.stores.issue(),
                fn.inc.stores.size()
            ]
        })
        .then(serial => {
            if (serial) {
                res.send({success: true, result: serial});
            } else {
                fn.send_error(res, err);
            };
        })
        .catch(err => fn.send_error(res, err));
    });

    app.post('/serials',             fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.serial.create(
            req.body.serial.serial,
            req.body.serial.size_id,
            req.user.user_id
        )
        .then(serial => {
            if (req.body.location) {
                fn.serials.set_location(
                    serial,
                    req.body.location,
                    req.user.user_id,
                    'on creation'
                )
                .then(result => res.send({success: true, message: 'Serial created, location set'}))
                .catch(err => {
                    console.log(err);
                    res.send({success: true, message: 'Serial created, location not set'});
                })
            } else {
                res.send({success: true, message: 'Serial created'});
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    
    app.put('/serials/:id',          fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.serials.edit(req.params.id, req.body.serial.serial, req.user.user_id)
        .then(result => res.send({success: true, message: 'Serial saved'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/serials/:id/transfer', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.serials.transfer(req.params.id, req.body.location, req.user.user_id)
        .then(result => res.send({success: true, message: 'Serial transferred'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/serials/:id/scrap',    fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.serials.scrap(req.params.id, req.body.scrap, req.user.user_id)
        .then(result => res.send({success: true, message: 'Serial scrapped'}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/serials/:id',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.serials.delete(req.params.id)
        .then(result => res.send({success: result, message: 'Serial deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};