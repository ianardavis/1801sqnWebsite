const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require('../../db/functions');

function options() {
    return [
        {table: 'ranks'},
        {table: 'statuses'}
    ]
};
module.exports = (app, m) => {
    // Index
    app.get('/stores/users', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_users', false, req, res, allowed => {
            if (!allowed) {
                res.redirect('/stores/users/' + req.user.user_id);
            } else {
                var query = Number(req.query.status) || 1;
                fn.getAll(
                    m.statuses
                )
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
                    .catch(err => {
                        fn.error(err, '/stores', req, res);
                    })
                });
            };
        });
    });

    // New Logic
    app.post('/stores/users', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_add', true, req, res, allowed => {
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
                .then(permission => {
                    res.redirect('/stores/users/' + user.user_id);
                })
                .catch(err => {
                    fn.error(err, '/stores/users', req, res);
                })
            })
            .catch(err => {
                fn.error(err, '/stores/users', req, res);
            })
        });
    });

    // New Form
    app.get('/stores/users/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_add', true, req, res, allowed => {
            fn.getOptions(options(), req, classes => {
                res.render('stores/users/new', {
                    classes: classes
                });
            });
        });
    });

    // Edit password
    app.get('/stores/password', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_password', false, req, res, allowed => {
            if (allowed || req.user.user_id === Number(req.query.user)) {
                fn.getOne(
                    m.users,
                    {user_id: req.query.user},
                    [m.ranks]
                )
                .then(user => {
                    res.render('stores/users/password', {user: user});
                })
                .catch(err => {
                    fn.error(err, '/stores/users/' + req.query.user, req, res);
                });
            } else {
                req.flash('danger', 'Permission Denied!');
                res.redirect('back');
            };
        });
    });

    // Edit password Put
    app.put('/stores/password/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_password', false, req, res, allowed => {
            if (allowed || req.user.user_id === Number(req.params.id)) {
                var bCrypt      = require('bcrypt');
                req.body.user._salt = bCrypt.genSaltSync(10)
                req.body.user._password = bCrypt.hashSync(req.body._password, req.body.user._salt);
                fn.update(
                    m.users,
                    req.body.user,
                    {user_id: req.params.id}
                )
                .then(result => {
                    res.redirect('/stores/users/' + req.params.id)
                })
                .catch(err => {
                    fn.error(err, '/stores/users/' + req.params.id, req, res);
                });
            } else {
                req.flash('danger', 'Permission Denied!');
                res.redirect('back');
            };
        });
    });

    // Edit
    app.get('/stores/users/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_edit', true, req, res, allowed => {
            fn.getOptions(options(), req, classes => {
                fn.getOne(
                    m.users,
                    {user_id: req.params.id},
                    [m.ranks]
                )
                .then(user => {
                    res.render('stores/users/edit', {
                        user:    user,
                        classes: classes
                    });
                })
                .catch(err => {
                    fn.error(err, '/stores/users/' + req.params.id, req, res);
                });
            });
        });
    });

    // Put
    app.put('/stores/users/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_edit', true, req, res, allowed => {
            fn.update(
                m.users,
                req.body.user,
                {user_id: req.params.id}
            )
            .then(result => {
                res.redirect('/stores/users/' + req.params.id)
            })
            .catch(err => {
                fn.error(err, '/stores/users/' + req.params.id, req, res);
            });
        });
    });

    // Delete
    app.delete('/stores/users/:id', mw.isLoggedIn, (req, res) => {
        if (req.user.user_id !== Number(req.params.id)) {
            fn.allowed('users_delete', true, req, res, allowed => {
                fn.delete(
                    m.users,
                    {user_id: req.params.id}
                )
                then(result => {
                    fn.delete(
                        m.permissions,
                        {user_id: req.params.id}
                    )
                    .then(result => {
                        res.redirect('/stores/users');
                    })
                    .catch(err => {
                        fn.error(err, '/stores/users', req, res);
                    });
                })
                .catch(err => {
                    fn.error(err, '/stores/users', req, res);
                });
            });
        } else {
            req.flash('danger', 'You can not delete yourself');
            res.redirect('/stores/users/' + req.params.id);
        };        
    });

    // Show
    app.get('/stores/users/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_users', false, req, res, allowed => {
            if (allowed || req.user.user_id === Number(req.params.id)) {
                var extended = {},
                    query = {};
                query.io = Number(req.query.io) || 2,
                query.cl = Number(req.query.cl) || 2,
                query.cr = Number(req.query.cr) || 2,
                query.ri = Number(req.query.ri) || 2;
                query.sn = Number(req.query.sn) || 2;
                extended.include = true;
                if (query.io === 2) {
                    extended.orders = {issue_id: null};
                } else if (query.io === 3) {
                    extended.orders = {issue_id: {[op.not]: null}};
                } else {
                    extended.orders = {};
                };
                if (query.cr === 2) {
                    extended.requests = {_status: 'Pending'};
                } else if (query.cr === 3) {
                    extended.requests = {_status: {[op.not]: 'Pending'}};
                } else {
                    extended.requests = {};
                };
                if (query.ri === 2) {
                    extended.issues = {_date_returned: null};
                } else if (query.ri === 3) {
                    extended.issues = {_date_returned: {[op.not]: null}};
                } else {
                    extended.issues = {};
                };
                fn.getOne(
                    m.users,
                    {user_id: req.params.id},
                    fn.userInclude(true, true, true)
                )
                .then(user => {
                    fn.getNotes('users', req.params.id, req, res)
                    .then(notes => {
                        res.render('stores/users/show', {
                            f_user: user, 
                            notes:  notes,
                            query:  query
                        });
                    });
                })
                .catch(err => {
                    fn.error(err, '/stores/users', req, res);
                });
            } else {
                req.flash('danger', 'Permission denied!')
                res.redirect('/stores/users');
            };
        });
    });
};