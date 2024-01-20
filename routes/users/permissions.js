module.exports = (app, fn) => {
    app.get('/get/permissions', fn.loggedIn(), fn.permissions.check('user_admin', true), (req, res) => {
        req.query.where.site_id = req.session.site.site_id;
        fn.users.permissions.get_all(
            req.user.user_id,
            req.allowed,
            req.query
        )
        .then(results => {
            fn.sendRes('permissions', res, results, req.query);
        })
        .catch(err => fn.sendError(res, err));
    });

    app.get('/get/permissions/tree', fn.loggedIn(), fn.permissions.check('user_admin'), (req, res) => {
        res.send({success: true, result: fn.users.permissions.tree()})
    });

    app.put('/permissions/:id', fn.loggedIn(), fn.permissions.check('user_admin', true), (req, res) => {
        fn.users.permissions.update(req.session.site.site_id, req.user.user_id, req.params.id, req.allowed, req.body.permissions)
        .then(results => res.send({success: true, message: 'Permissions edited'}))
        .catch(err => fn.sendError(res, err));
    });
};