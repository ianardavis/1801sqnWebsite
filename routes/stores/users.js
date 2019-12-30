const op = require('sequelize').Op;
function options() {
    return [
        {table: 'ranks'},
        {table: 'statuses'}
    ]
};
module.exports = (app, allowed, fn, isLoggedIn, m) => {
    // Index
    app.get('/stores/users', isLoggedIn, allowed('access_users', false), (req, res) => {
        if (!req.allowed) res.redirect('/stores/users/' + req.user.user_id);
        else {
            var query = Number(req.query.status) || 1;
            fn.getAll(m.statuses)
            .then(statuses => {
                fn.getAllWhere(
                    m.users,
                    {
                        user_id: {[op.not]: 1},
                        status_id: query
                    },
                    [m.ranks]
                )
                .then(users => {
                    res.render('stores/users/index', {
                        users:    users,
                        status:   query,
                        statuses: statuses
                    });
                })
                .catch(err => fn.error(err, '/stores', req, res))
            });
        };
    });

    // New Logic
    app.post('/stores/users', isLoggedIn, allowed('users_add'), (req, res) => {
        var bCrypt  = require('bcrypt'),
            salt = bCrypt.genSaltSync(10);
        req.body.user._salt = salt;
        req.body.user._password = bCrypt.hashSync(req.body._password, salt);
        req.body.user._reset = 0
        fn.create(
            m.users,
            req.body.user
        )
        .then(user => {
            fn.create(
                m.permissions,
                {user_id: user.user_id}
            )
            .then(permission => res.redirect('/stores/users/' + user.user_id))
            .catch(err => fn.error(err, '/stores/users', req, res))
        })
        .catch(err => fn.error(err, '/stores/users', req, res));
    });

    // New Form
    app.get('/stores/users/new', isLoggedIn, allowed('users_add'), (req, res) => fn.getOptions(options(), req, classes => res.render('stores/users/new', {classes: classes})));

    // Edit password
    app.get('/stores/password', isLoggedIn, allowed('users_password', false), (req, res) => {
        if (req.allowed || req.user.user_id === Number(req.query.user)) {
            fn.getOne(
                m.users,
                {user_id: req.query.user},
                {include: [m.ranks], attributes: null, nullOK: false}
            )
            .then(user => res.render('stores/users/password', {user: user}))
            .catch(err => fn.error(err, '/stores/users/' + req.query.user, req, res));
        } else {
            req.flash('danger', 'Permission Denied!');
            res.redirect('back');
        };
    });

    // Edit password Put
    app.put('/stores/password/:id', isLoggedIn, allowed('users_password', false), (req, res) => {
        if (req.allowed || req.user.user_id === Number(req.params.id)) {
            var bCrypt      = require('bcrypt');
            req.body.user._salt = bCrypt.genSaltSync(10)
            req.body.user._password = bCrypt.hashSync(req.body._password, req.body.user._salt);
            fn.update(
                m.users,
                req.body.user,
                {user_id: req.params.id}
            )
            .then(result => res.redirect('/stores/users/' + req.params.id))
            .catch(err => fn.error(err, '/stores/users/' + req.params.id, req, res));
        } else {
            req.flash('danger', 'Permission Denied!');
            res.redirect('back');
        };
    });

    // Edit
    app.get('/stores/users/:id/edit', isLoggedIn, allowed('users_edit'), (req, res) => {
        fn.getOptions(options(), req, classes => {
            fn.getOne(
                m.users,
                {user_id: req.params.id},
                {include: [m.ranks], attributes: null, nullOK: false}
            )
            .then(user => {
                res.render('stores/users/edit', {
                    user:    user,
                    classes: classes
                });
            })
            .catch(err => fn.error(err, '/stores/users/' + req.params.id, req, res));
        });
    });

    // Put
    app.put('/stores/users/:id', isLoggedIn, allowed('users_edit'), (req, res) => {
        fn.update(
            m.users,
            req.body.user,
            {user_id: req.params.id}
        )
        .then(result => res.redirect('/stores/users/' + req.params.id))
        .catch(err => fn.error(err, '/stores/users/' + req.params.id, req, res));
    });

    // Delete
    app.delete('/stores/users/:id', isLoggedIn, allowed('users_delete'), (req, res) => {
        if (Number(req.user.user_id) !== Number(req.params.id)) {
            fn.delete(
                'users',
                {user_id: req.params.id}
            )
            .then(result => {
                if (result) req.flash('success', 'User deleted');
                fn.delete(
                    'permissions',
                    {user_id: req.params.id}
                )
                .then(result => {
                    if (result) req.flash('success', 'Permission deleted');
                    res.redirect('/stores/users');
                })
                .catch(err => fn.error(err, '/stores/users', req, res));
            })
            .catch(err => fn.error(err, '/stores/users', req, res));
        } else {
            req.flash('danger', 'You can not delete your own account');
            res.redirect('/stores/users/' + req.params.id);
        };        
    });

    // Show
    app.get('/stores/users/:id', isLoggedIn, allowed('access_users', false), (req, res) => {
        if (req.allowed || req.user.user_id === Number(req.params.id)) {
            var where = {},
                query = {};
            query.io = Number(req.query.io) || 2,
            query.cl = Number(req.query.cl) || 2,
            query.cr = Number(req.query.cr) || 2,
            query.ri = Number(req.query.ri) || 2;
            query.sn = Number(req.query.sn) || 2;
            where.requests = {};
            where.orders = {};
            where.issues = {};
            if (query.io === 2) where.orders.issue_line_id = null;
            else if (query.io === 3) where.orders.issue_line_id = {[op.not]: null};

            if (query.cr === 2) where.requests._status = 'Pending';
            else if (query.cr === 3) where.requests._status = {[op.not]: 'Pending'};

            if (query.ri === 2) where.issues.return_line_id = null;
            else if (query.ri === 3) where.issues.return_line_id = {[op.not]: null};

            fn.getOne(
                m.users,
                {user_id: req.params.id},
                {include: fn.userInclude(false, false, false), attributes: null, nullOK: false}
            )
            .then(user => {
                fn.getAllWhere(
                    m.requests_l,
                    where.requests,
                    [
                        {
                            model: m.requests,
                            where: {requested_for: user.user_id}
                        },
                        fn.item_sizes(true, true, false)
                    ]
                )
                .then(requests => {
                    fn.getAllWhere(
                        m.orders_l,
                        where.orders,
                        [
                            {
                                model: m.orders,
                                where: {ordered_for: user.user_id}
                            },
                            fn.item_sizes(true, true, false)
                        ]
                    )
                    .then(orders => {
                        fn.getAllWhere(
                            m.issues_l,
                            where.issues,
                            [
                                {
                                    model: m.issues,
                                    where: {issued_to: user.user_id}
                                },
                                fn.item_sizes(true, true, false)
                            ]
                        )
                        .then(issues => {
                            fn.getNotes('users', req.params.id, req)
                            .then(notes => {
                                res.render('stores/users/show', {
                                    f_user:   user, 
                                    requests: requests,
                                    orders:   orders,
                                    issues:   issues,
                                    notes:    notes,
                                    query:    query
                                });
                            });
                        })
                        .catch(err => fn.error(err, '/stores/users', req, res));
                    })
                    .catch(err => fn.error(err, '/stores/users', req, res));
                })
                .catch(err => fn.error(err, '/stores/users', req, res));
            })
            .catch(err => fn.error(err, '/stores/users', req, res));
        } else {
            req.flash('danger', 'Permission denied!')
            res.redirect('/stores/users');
        };
    });
};