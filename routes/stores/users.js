const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require('../../db/functions');
module.exports = (app, m) => {
    // Index
    app.get('/stores/users', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_users', false, req, res, (allowed) => {
            if (!allowed) {
                res.redirect('/stores/users/' + req.user.user_id);
            } else {
                var query = Number(req.query.status) || 1;
                fn.getAll(m.statuses, req, true, (statuses) => {
                    fn.getAllUsersWhere({user_id: {[op.not]: 1}, status_id: query}, req, (users) => {
                        res.render('stores/users/index', {
                            users: users,
                            status: query,
                            statuses: statuses
                        });
                    });
                });
            };
        });
    });

    // New Logic
    app.post('/stores/users', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_add', true, req, res, (allowed) => {
            var bCrypt  = require('bcrypt'),
                salt = bCrypt.genSaltSync(10);
            req.body.user._salt = salt;
            req.body.user._password = bCrypt.hashSync(req.body._password, salt);
            req.body.user._reset = 0
            fn.create(m.users, req.body.user, req, (user) => {
                if (user) {
                    fn.create(m.permissions, {user_id: user.user_id}, req, (permission) => {
                        
                        res.redirect('/stores/users/' + user.user_id);
                    });
                } else {
                    req.flash('danger', 'Error adding new user!');
                    res.redirect('/stores/users');
                }
            });
        });
    });

    // New Form
    app.get('/stores/users/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_add', true, req, res, (allowed) => {
            fn.getAllUserClasses(req, res, (classes) => {
                res.render('stores/users/new', {
                    classes: classes
                });
            });
        });
    });

    // Edit password
    app.get('/stores/password/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_password', false, req, res, (allowed) => {
            if (allowed || req.user.user_id === Number(req.params.id)) {
                fn.getUser(req.params.id, {include: false}, req, (user) => {
                    if (user) {
                        res.render('stores/users/password', {user: user});
                    } else {
                        res.render('stores/users/' + req.params.id);
                    };
                });
            };
        });
    });

    // Edit password Put
    app.put('/stores/password/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_password', true, req, res, (allowed) => {
            if (req.user.user_id === Number(req.params.id)) {
                var bCrypt      = require('bcrypt');
                req.body.user._salt = bCrypt.genSaltSync(10)
                req.body.user._password = bCrypt.hashSync(req.body._password, req.body.user._salt);
                fn.update(m.users, req.body.user, {user_id: req.params.id}, req, (result) => {
                    res.redirect('/stores/users/' + req.params.id)
                });
            };
        });
    });

    // Edit
    app.get('/stores/users/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_edit', true, req, res, (allowed) => {
            fn.getAllUserClasses(req, res, (classes) => {
                fn.getUser(req.params.id, {include: false}, req, (user) => {
                    if (user) {
                        res.render('stores/users/edit', {
                            user:    user,
                            classes: classes
                        });
                    } else {
                        res.render('stores/users/' + req.params.id);
                    }
                });
            });
        });
    });

    // Put
    app.put('/stores/users/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_edit', true, req, res, (allowed) => {
            if (!req.body.user._reset) {req.body.user._reset = 0}
            fn.update(m.users, req.body.user, {user_id: req.params.id}, req, (result) => {
                res.redirect('/stores/users/' + req.params.id)
            });
        });
    });

    // Delete
    app.delete('/stores/users/:id', mw.isLoggedIn, (req, res) => {
        if (req.user.user_id !== Number(req.params.id)) {
            fn.allowed('users_delete', true, req, res, (allowed) => {
                fn.delete(m.users, {user_id: req.params.id}, req, (result) => {
                    fn.delete(m.permissions, {user_id: req.params.id}, req, (result) => {
                        res.redirect('/stores/users');
                    });
                });
            });
        } else {
            req.flash('danger', 'You can not delete yourself!!');
            res.redirect('/stores/users/' + req.params.id);
        };        
    });

    // Show
    app.get('/stores/users/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_users', false, req, res, (allowed) => {
            if (allowed || req.user.user_id === Number(req.params.id)) {
                var extended = {},
                    query = {};
                query.issuedOrders    = Number(req.query.orders)    || 2,
                query.closedLoancards = Number(req.query.loancards) || 2,
                query.closedRequests  = Number(req.query.requests)  || 2,
                query.returnedIssues  = Number(req.query.issues)    || 2;
                extended.include = true;
                if (query.issuedOrders === 2) {
                    extended.orders = {issue_id: null};
                } else if (query.issuedOrders === 3) {
                    extended.orders = {issue_id: {[op.not]: null}};
                } else {
                    extended.orders = {};
                };
                if (query.closedLoancards === 2) {
                    extended.loancards = {_closed: null};
                } else if (query.closedLoancards === 3) {
                    extended.loancards = {_closed: {[op.not]: null}};
                } else {
                    extended.loancards = {};
                };
                if (query.closedRequests === 2) {
                    extended.requests = {_status: 'Pending'};
                } else if (query.closedRequests === 3) {
                    extended.requests = {_status: {[op.not]: 'Pending'}};
                } else {
                    extended.requests = {};
                };
                if (query.returnedIssues === 2) {
                    extended.issues = {_date_returned: null};
                } else if (query.returnedIssues === 3) {
                    extended.issues = {_date_returned: {[op.not]: null}};
                } else {
                    extended.issues = {};
                };
                fn.getUser(req.params.id, extended, req, (user) => {
                    if (user) {
                        fn.getNotes('users', req.params.id, req, res, (notes) => {
                            res.render('stores/users/show', {
                                user:  user, 
                                notes: notes,
                                query: query
                            });
                        });
                    } else {
                        res.redirect('/stores/users');
                    };
                });
            } else {
                req.flash('danger', 'Permission denied!')
                res.redirect('/stores/users');
            };
        });
    });
};