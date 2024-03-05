module.exports = (app, fn) => {
    app.get('/users',             fn.loggedIn, fn.permissions.get('access_users',   true), (req, res) => {
        if (req.allowed) {
            res.render('users/index');

        } else {
            fn.redirect(res, `/users/${req.user.user_id}`);
        
        };
    });
    app.get('/users/select',      fn.loggedIn,                                             (req, res) => res.render('users/select'));
    app.get('/password/:id',      fn.loggedIn, fn.permissions.get('access_stores'),        (req, res) => res.render('users/password'));
    app.get('/users/:id',         fn.loggedIn, fn.permissions.get('access_users',   true), (req, res) => {
        if (req.allowed || req.params.id == req.user.user_id) {
            res.render('users/show');

        } else {
            fn.redirect(res, `/users/${req.user.user_id}`);
        
        };
    });

    app.get('/get/user',          fn.loggedIn, fn.permissions.check('access_users', true), (req, res) => {
        fn.users.find(
            req.query.where,
            ['user_id', 'full_name', 'service_number', 'first_name', 'surname', 'status_id', 'rank_id', 'login_id', 'reset', 'last_login']
        )
        .then(user => {
            if (req.allowed || user.user_id === req.user.user_id) {
                res.send({success: true, result: user});

            } else {
                fn.sendError(res, 'Permission denied');

            };
        })
        .catch(err => {
            if (req.allowed || user.user_id === req.user.user_id) {
                fn.sendError(res, err);

            } else {
                fn.sendError(res, 'Permission denied');

            };
        });
    });
    app.get('/get/users',         fn.loggedIn, fn.permissions.check('access_users', true), (req, res) => {
        if (!req.allowed) req.query.where.user_id = req.user.user_id;
        fn.users.findAll(req.query, {extra_attributes: ['service_number']})
        .then(results => fn.sendRes('users', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/users/current', fn.loggedIn, fn.permissions.check('access_users', true), (req, res) => {
        if (!req.query.where) req.query.where = {};
        if (!req.allowed)     req.query.where.user_id = req.user.user_id;
        fn.users.findAll(
            req.query,
            {status_include: fn.inc.users.status({current: true})}
        )
        .then(results => fn.sendRes('users', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/users/existing', fn.loggedIn,                                            (req, res) => {
        fn.users.findAll(
            req.query,
            { status_include: fn.inc.users.status( { current: true } ) }
        )
        .then(results => fn.sendRes('users', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });

    app.post('/users',            fn.loggedIn, fn.permissions.check('user_admin'),         (req, res) => {
        fn.users.create(req.body.user)
        .then(password => res.send({
            success: true,
            message: `User added. Password: ${password}. Password shown in UPPER CASE for readability. Password to be entered in lowercase, do not enter '-'. User must change at first login`
        }))
        .catch(err => fn.sendError(res, err));
    });
    
    app.put('/password/:id',      fn.loggedIn, fn.permissions.check('user_admin',   true), (req, res) => {
        if (!req.allowed && String(req.user.user_id) !== String(req.params.id)) {
            fn.sendError(res, 'Permission denied');

        } else if (!req.body.password) {
            fn.sendError(res, 'No password submitted');

        } else {
            fn.users.password.edit(req.params.id, req.body.password)
            .then(result => res.send({success: true, message: 'Password changed'}))
            .catch(err => fn.sendError(res, err));
        };
    });
    app.put('/password/:id/toggle', fn.loggedIn, fn.permissions.check('user_admin'),       (req, res) => {
        fn.users.toggleReset(req.params.id)
        .then(result => res.send({success: true, message: 'Password reset toggled'}))
        .catch(err => fn.sendError(res, err));
    });

    app.put('/users/:id',         fn.loggedIn, fn.permissions.check('user_admin'),         (req, res) => {
        fn.users.edit(req.params.id, req.body.user)
        .then(result => res.send({success: true, message: 'User saved'}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.delete('/users/:id',      fn.loggedIn, fn.permissions.check('user_admin'),         (req, res) => {
        fn.users.delete(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'User deleted'}))
        .catch(err => fn.sendError(res, err));
    });
};
