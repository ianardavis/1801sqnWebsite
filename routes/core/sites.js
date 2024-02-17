module.exports = (app, fn) => {
    app.get('/sites',                     fn.loggedIn, fn.adminSiteOnly, fn.permissions.get('site_admin'), (req, res) => res.render('sites/index'));
    app.get('/sites/:id',                 fn.loggedIn, fn.adminSiteOnly, fn.permissions.get('site_admin'), (req, res) => res.render('sites/show'));
    app.get('/get/sites',                 fn.loggedIn, (req, res) => {
        // Only return sites the current user is added to
        fn.sites.findAll(req.query, [{model: m.users, where: {user_id: req.user.user_id}, required: true}])
        .then(sites => fn.sendRes('sites', res, sites, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/site',                  fn.loggedIn, (req, res) => {
        // Only a user who is on a site can get details about that site
        fn.sites.find(req.query.where, [{model: m.users, where: {user_id: req.user.user_id}, required: true}])
        .then(site => res.send({success: true, result: site}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/site/:id/users',        fn.loggedIn, (req, res) => {
        fn.sites.find(req.query.where, [{model: m.users, where: {user_id: req.user.user_id}, required: true}])
        .then(site => res.send({success: true, result: site}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/sites/own',             fn.loggedIn, (req, res) => {
        fn.sites.findForUser(req.user.user_id)
        .then(sites => res.send({success: true, result: sites}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/sites/user/:id',        fn.loggedIn, fn.permissions.check('site_admin'), (req, res) => {
        fn.sites.findForUser(req.params.id)
        .then(sites => res.send({success: true, result: sites}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/site/current',          fn.loggedIn, (req, res) => {
        fn.sites.findCurrent(req.session.site.site_id)
        .then(site => res.send({success: true, result: site}))
        .catch(err => fn.sendError(res, err));
    });

    app.put('/sites/switch/:id',          fn.loggedIn, (req, res) => {
        fn.sites.switch(req)
        .then(result => res.send({success: true, result: true}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.post('/sites',                    fn.loggedIn, fn.adminSiteOnly, fn.permissions.check('site_admin'), (req, res) => {
        if (req.session.site.site_id) {
            fn.sites.create(req.body.site.name, req.user.user_id)
            .then(result => res.send({success: true, result: true}))
            .catch(err => fn.sendError(res, err));
        } else {

        };
    });
    app.post('/sites/:id/users/new',      fn.loggedIn, fn.permissions.check('site_admin'), (req, res) => {
        res.send({success: true, message: 'New user added'});
    });
    app.post('/sites/:id/users/existing', fn.loggedIn, fn.permissions.check('site_admin'), (req, res) => {
        res.send({success: true, message: 'Existing user added'});
    });
    
    app.delete('/sites/:id',              fn.loggedIn, fn.permissions.check('site_admin'), (req, res) => {
        fn.sites.delete(req.params.id)
        .then(note => res.send({success: true, message: 'Site deleted'}))
        .catch(err => fn.sendError(res, err));
    });
};