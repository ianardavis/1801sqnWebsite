module.exports = (app, fn) => {
    app.get('/issues',          fn.loggedIn(), fn.permissions.get(  'access_stores'),       (req, res) => res.render('stores/issues/index'));
    app.get('/issues/:id',      fn.loggedIn(), fn.permissions.get(  'access_stores', true), (req, res) => res.render('stores/issues/show'));

    app.get('/count/issues',    fn.loggedIn(), fn.permissions.check('issuer',        true), (req, res) => {
        if (!req.allowed) req.query.where.user_id_issue = req.user.user_id;
        fn.issues.count(req.query.where)
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/sum/issues',      fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.issues.sum(req.query.where)
        .then(sum => res.send({success: true, result: sum}))
        .catch(err => fn.send_error(res, err));
    });

    app.get('/get/issues',      fn.loggedIn(), fn.permissions.check('issuer',        true), (req, res) => {
        fn.issues.get_all(req.allowed, req.query, req.user.user_id)
        .then(results => fn.send_res('issues', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/issue',       fn.loggedIn(), fn.permissions.check('issuer',        true), (req, res) => {
        if (!req.allowed) req.query.where["user_id_issue"] = req.user.user_id;
        console.log(req.query.where);
        fn.issues.get(req.query.where, {order: true, loancard_lines: true})
        .then(issue => res.send({success: true, result: issue}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/issues',         fn.loggedIn(), fn.permissions.check('issuer',        true), (req, res) => {
        fn.issues.create(req.body.issues, req.user.user_id, (req.allowed ? 2 : 1))
        .then(result => res.send({success: true, message: 'Issue(s) added'}))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/issues',          fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.issues.update(req.body.lines, req.user.user_id)
        .then(message => res.send({success: true, message: message}))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/issues/:id/qty',  fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.issues.change_qty(req.params.id, req.body.qty , req.user.user_id)
        .then(result => res.send({success: true, message: 'Quantity updated'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/issues/:id/size', fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.issues.change_size(req.params.id, req.body.size_id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Size updated'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/issues/:id/mark', fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.issues.mark_as(req.params.id, req.body.issue.status, req.user.user_id)
        .then(message => res.send({success: true, message: message}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/issues/:id',   fn.loggedIn(), fn.permissions.check('access_stores'),       (req, res) => {
        fn.issues.cancel_own(req.params.id,req.user.user_id)
        .then(result => res.send({success: true, message: 'Request cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
};