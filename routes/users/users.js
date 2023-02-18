module.exports = (app, fn) => {
    app.get('/users',             fn.loggedIn(), fn.permissions.get('access_users',   true), (req, res) => {
        if (req.allowed) {
            res.render('users/index');

        } else {
            res.redirect(`/users/${req.user.user_id}`);
        
        };
    });
    app.get('/users/select',      fn.loggedIn(),                                             (req, res) => res.render('users/select'));
    app.get('/password/:id',      fn.loggedIn(),                                             (req, res) => res.render('users/password'));
    app.get('/users/:id',         fn.loggedIn(), fn.permissions.get('access_users',   true), (req, res) => {
        if (req.allowed || req.params.id == req.user.user_id) {
            res.render('users/show');

        } else {
            res.redirect(`/users/${req.user.user_id}`);
        
        };
    });

    app.get('/get/user',          fn.loggedIn(), fn.permissions.check('access_users', true), (req, res) => {
        fn.users.get(
            req.query.where,
            ['user_id', 'full_name', 'service_number', 'first_name', 'surname', 'status_id', 'rank_id', 'login_id', 'reset', 'last_login']
        )
        .then(user => {
            if (req.allowed || user.user_id === req.user.user_id) {
                res.send({success: true, result: user});

            } else {
                fn.send_error(res, 'Permission denied');

            };
        })
        .catch(err => {
            if (req.allowed || user.user_id === req.user.user_id) {
                fn.send_error(res, err);

            } else {
                fn.send_error(res, 'Permission denied');

            };
        });
    });
    app.get('/get/users',         fn.loggedIn(), fn.permissions.check('access_users', true), (req, res) => {
        if (!req.allowed) req.query.where.user_id = req.user.user_id;
        fn.users.getAll(
            req.query.where,
            fn.pagination(req.query)
        )
        .then(results => fn.send_res('users', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/users/current', fn.loggedIn(), fn.permissions.check('access_users', true), (req, res) => {
        let where = req.query.where;
        if (!req.allowed) user_id = req.user.user_id;
        fn.users.getAll(
            where,
            fn.pagination(req.query),
            fn.inc.users.status({current: true})
        )
        .then(results => fn.send_res('users', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/users',            fn.loggedIn(), fn.permissions.check('user_admin'),         (req, res) => {
        fn.users.create(req.body.user)
        .then(password => res.send({success: true, message: `User added. Password: ${password}. Password shown in UPPER CASE for readability. Password to be entered in lowercase, do not enter '-'. User must change at first login`}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.put('/password/:id',      fn.loggedIn(), fn.permissions.check('user_admin',   true), (req, res) => {
        if (!req.allowed && String(req.user.user_id) !== String(req.params.id)) {
            fn.send_error(res, 'Permission denied');

        } else if (!req.body.password) {
            fn.send_error(res, 'No password submitted');

        } else {
            fn.users.password.edit(req.params.id, req.body.password)
            .then(result => res.send({success: true, message: 'Password changed'}))
            .catch(err => fn.send_error(res, err));
        };
    });
    app.put('/users/:id',         fn.loggedIn(), fn.permissions.check('user_admin'),         (req, res) => {
        fn.users.edit(req.params.id, req.body.user)
        .then(result => res.send({success: true, message: 'User saved'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/users/:id',      fn.loggedIn(), fn.permissions.check('user_admin'),         (req, res) => {
        fn.users.delete(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'User deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};