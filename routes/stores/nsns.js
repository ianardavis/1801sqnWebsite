module.exports = (app, fn) => {
    app.get('/nsns/:id',          fn.loggedIn(), fn.permissions.get('access_stores'),        (req, res) => res.render('stores/nsns/show'));
    app.get('/get/nsns',          fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.nsns.findAll(req.query)
        .then(nsns => fn.sendRes('nsns', res, nsns, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/nsn',           fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.nsns.find(req.query.where, false)
        .then(nsn => res.send({success: true, result: nsn}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/nsn_groups',    fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.nsns.groups.findAll(req.query)
        .then(results => fn.sendRes('nsn_groups', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/nsn_classes',   fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.nsns.classes.findAll(req.query)
        .then(results => fn.sendRes('nsn_classes', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/nsn_countries', fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.nsns.countries.findAll(req.query)
        .then(results => fn.sendRes('nsn_countries', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });

    app.post('/nsns',             fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.nsns.create(req.body.nsn, req.body.default)
        .then(message => res.send({success: true, message: `NSN added.${message}`}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.put('/nsns/:id',          fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.nsns.edit(req.params.id, req.body.nsn)
        .then(result => res.send({success: true, message: 'NSN saved'}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.delete('/nsns/:id',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.nsns.delete(req.params.id)
        .then(result => res.redirect(`/sizes/${nsn.size_id}`))
        .catch(err => fn.sendError(res, err));
    });
};