module.exports = (app, m, fn) => {
    let user_attributes = ['user_id', 'full_name', 'surname', 'first_name', 'service_number'];
    app.get('/users',             fn.loggedIn(), fn.permissions.get('access_users',   true), (req, res) => {
        if (req.allowed) res.render('users/index')
        else             res.redirect(`/users/${req.user.user_id}`);
    });
    app.get('/users/select',      fn.loggedIn(),                                             (req, res) => res.render('users/select'));
    app.get('/password/:id',      fn.loggedIn(),                                             (req, res) => res.render('users/password'));
    app.get('/users/:id',         fn.loggedIn(), fn.permissions.get('access_users',   true), (req, res) => {
        if (req.allowed || req.params.id == req.user.user_id) res.render('users/show')
        else                                                  res.redirect(`/users/${req.user.user_id}`);
    });

    app.get('/get/user',          fn.loggedIn(), fn.permissions.check('access_users', true), (req, res) => {
        m.users.findOne({
            where:      req.query.where,
            include:    [fn.inc.users.rank(), fn.inc.users.status()],
            attributes: ['user_id', 'full_name', 'service_number', 'first_name', 'surname', 'status_id', 'rank_id', 'login_id', 'reset', 'last_login']
        })
        .then(user => {
            if (user.user_id === req.user.user_id || req.allowed) {
                if (!user) fn.send_error(res, 'User not found')
                else res.send({success: true, result: user});
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/users',         fn.loggedIn(), fn.permissions.check('access_users', true), (req, res) => {
        if (!req.allowed) req.query.user_id = req.user.user_id;
        m.users.findAdCountAll({
            where:      req.query.where,
            include:    [fn.inc.users.rank(), fn.inc.users.status()],
            attributes: user_attributes,
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('users', res, results, req.query))
        .catch(err =>  fn.send_error(res, err));
    });
    app.get('/get/users_current', fn.loggedIn(), fn.permissions.check('access_users', true), (req, res) => {
        let where = null
        if (!req.allowed) where = {user_id: req.user.user_id};
        m.users.findAndCountAll({
            where: where,
            include:    [
                fn.inc.users.rank(),
                fn.inc.users.status({
                    where: {status: {[fn.op.substring]: 'Current'}},
                    required: true
                })
            ],
            attributes: user_attributes,
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('users', res, results, req.query))
        .catch(err =>  fn.send_error(res, err));
    });

    app.post('/users',            fn.loggedIn(), fn.permissions.check('user_admin'),         (req, res) => {
        fn.users.create(req.body.user)
        .then(password => res.send({success: true, message: `User added. Password: ${password}. Password shown in UPPER CASE for readability. Password to be entered in lowercase, do not enter '-'. User must change at first login`}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.put('/password/:id',      fn.loggedIn(), fn.permissions.check('user_admin',   true), (req, res) => {
        if      (!req.allowed && String(req.user.user_id) !== String(req.params.id)) fn.send_error(res, 'Permission denied')
        else if (!req.body.password)                                                 fn.send_error(res, 'No password submitted')
        else {
            fn.users.password.edit(req.params.id, req.body.password)
            .then(result => res.send({success: true, message: 'Password changed'}))
            .catch(err => fn.send_error(res, err));
        };
    });
    app.put('/users/:id',         fn.loggedIn(), fn.permissions.check('user_admin'),         (req, res) => {
        fn.users.edit(req.params.id, req.body.user)
        .then(result => res.send({success: true,  message: 'User saved'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/users/:id',      fn.loggedIn(), fn.permissions.check('user_admin'),         (req, res) => {
        if (req.user.user_id == req.params.id) fn.send_error(res, 'You can not delete your own account')
        else {
            fn.users.delete(req.params.id)
            .then(result => res.send({success: true, message: 'User deleted'}))
            .catch(err => fn.send_error(res, err));
        };
    });
};