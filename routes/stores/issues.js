module.exports = (app, fn) => {
    app.get('/issues',          fn.loggedIn, fn.permissions.get(  'access_stores'),       (req, res) => res.render('stores/issues/index'));
    app.get('/issues/:id',      fn.loggedIn, fn.permissions.get(  'access_stores', true), (req, res) => res.render('stores/issues/show'));

    app.get('/count/issues',    fn.loggedIn, fn.permissions.check('issuer',        true), (req, res) => {
        if (!req.allowed) req.query.where.user_id_issue = req.user.user_id;
        req.query.where.site_id = req.session.site.site_id;
        fn.issues.count(req.query.where)
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/sum/issues',      fn.loggedIn, fn.permissions.check('issuer'),              (req, res) => {
        req.query.where.site_id = req.session.site.site_id;
        fn.issues.sum(req.query.where)
        .then(sum => res.send({success: true, result: sum}))
        .catch(err => fn.sendError(res, err));
    });

    app.get('/get/issues',      fn.loggedIn, fn.permissions.check('issuer',        true), (req, res) => {
        req.query.where.site_id = req.session.site.site_id;
        fn.issues.findAll(req.allowed, req.query, req.user.user_id)
        .then(results => fn.sendRes('issues', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/issue',       fn.loggedIn, fn.permissions.check('issuer',        true), (req, res) => {
        if (!req.allowed) req.query.where["user_id_issue"] = req.user.user_id;
        fn.issues.find(
            req.session.site.site_id,
            req.query.where,
            { order: true, loancard_lines: true }
        )
        .then(issue => res.send({success: true, result: issue}))
        .catch(err => fn.sendError(res, err));
    });

    app.post('/issues',         fn.loggedIn, fn.permissions.check('issuer',        true), (req, res) => {
        fn.issues.create(req.sessions.site_id, req.body.issues, req.user.user_id, (req.allowed ? 2 : 1))
        .then(result => res.send({success: true, message: 'Issue(s) added'}))
        .catch(err => fn.sendError(res, err));
    });

    app.put('/issues',          fn.loggedIn, fn.permissions.check('issuer'),              (req, res) => {
        fn.issues.update(req.body.lines, req.session.site.site_id, req.user.user_id)
        .then(message => res.send({success: true, message: message}))
        .catch(err => fn.sendError(res, err));
    });

    app.put('/issues/:id/qty',  fn.loggedIn, fn.permissions.check('issuer'),              (req, res) => {
        fn.issues.changeQty(req.params.id, req.session.site.site_id, req.body.qty , req.user.user_id)
        .then(result => res.send({success: true, message: 'Quantity updated'}))
        .catch(err => fn.sendError(res, err));
    });
    app.put('/issues/:id/size', fn.loggedIn, fn.permissions.check('issuer'),              (req, res) => {
        fn.issues.changeSize(req.params.id, req.session.site.site_id, req.body.size_id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Size updated'}))
        .catch(err => fn.sendError(res, err));
    });
    app.put('/issues/:id/mark', fn.loggedIn, fn.permissions.check('issuer'),              (req, res) => {
        fn.issues.markAs(req.params.id, req.session.site.site_id, req.body.issue.status, req.user.user_id)
        .then(message => res.send({success: true, message: message}))
        .catch(err => fn.sendError(res, err));
    });

    app.delete('/issues/:id',   fn.loggedIn, fn.permissions.check('access_stores'),       (req, res) => {
        fn.issues.cancelOwn(req.params.id, req.session.site.site_id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Request cancelled'}))
        .catch(err => fn.sendError(res, err));
    });
};