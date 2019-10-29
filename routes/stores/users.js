const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require('../../db/functions');
module.exports = (app, m) => {
    // Index
    app.get('/stores/users', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_users', res, (allowed) => {
            if (allowed) {
                var query = Number(req.query.status) || 1;
                fn.getAll(m.statuses, req, res, true, (statuses) => {
                    m.users.findAll({
                        attributes: ['user_id', '_bader', '_name', '_ini', '_rank', '_status'],
                        where:      {
                            user_id: {[op.not]: 1},
                            _status: query
                        },
                        include:    [m.ranks, m.statuses]
                    }).then((user_list) => {
                        res.render('stores/users/index', {
                            users: user_list,
                            status: query,
                            statuses: statuses
                        });
                    }).catch((err) => {
                        req.flash('danger', 'Error loading users!')
                        console.log(err);
                        res.redirect('/stores');
                    });
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores');
            };
        });
    });

    // New Logic
    app.post('/stores/users', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_add', res, (allowed) => {
            if (allowed) {
                var bCrypt  = require('bcrypt'),
                    salt = bCrypt.genSaltSync(10);
                req.body.user._salt = salt;
                req.body.user._password = bCrypt.hashSync(req.body._password, salt);
                req.body.user._reset = 0
            m.users.create(
                req.body.user
            ).then((user) => {
                if (user) {
                    m.permissions.create({
                        user_id: user.user_id
                    }).then((result) => {
                        req.flash('success', 'User added!');
                        res.redirect('/stores/users/' + user.user_id);
                    }).catch((err) => {
                        req.flash('danger', 'Error adding new users permissions!');
                        res.redirect('/stores/users');
                    })
                } else {
                    req.flash('danger', 'Error adding new user!');
                    res.redirect('/stores/users');
                }
            }).catch((err) => {
                req.flash('danger', 'Error adding new user!')
                console.log(err);
                res.redirect('/stores/users');
            });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/users');
            }
        });
    });

    // New Form
    app.get('/stores/users/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_add', res, (allowed) => {
            if (allowed) {
                fn.getAllUserClasses(req, res, (classes) => {
                    res.render('stores/users/new', {
                        classes: classes
                    });
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/users');
            }
        });
    });

    // Edit password
    app.get('/stores/password/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_password', res, (allowed) => {
            if (allowed || req.user.user_id === Number(req.params.id)) {
                m.users.findOne({
                attributes: ['user_id', '_bader', '_name', '_ini', '_rank', '_gender', '_status', '_reset', '_login_id', '_last_login'],
                where: {
                    user_id: req.params.id
                },
                include: [m.ranks]
            }).then((user) => {
                if (!user) {
                    req.flash('danger', 'Error retrieving user!');
                    res.render('stores/users/' + req.params.id);
                } else {
                    res.render('stores/users/password', {user: user});
                }
            }).catch((err) => {
                req.flash('danger', 'Error loading users!');
                console.log(err);
                res.redirect('stores/users/' + req.params.id);
            });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/users');
            }
        });
    });

    // Edit password Put
    app.put('/stores/password/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_password', res, (allowed) => {
            if (allowed || req.user.user_id === Number(req.params.id)) {
                var bCrypt      = require('bcrypt');
                req.body.user._salt = bCrypt.genSaltSync(10)
                req.body.user._password = bCrypt.hashSync(req.body._password, req.body.user._salt);
                m.users.update(
                    req.body.user
                    ,{
                        where: {user_id: req.params.id}
                    }
                ).then((user) => {
                    req.flash('success', 'Password changed');
                    res.redirect('/stores/users/' + req.params.id)
                }).catch((err) => {
                    req.flash('danger', 'Error changing password!');
                    console.log(err);
                    res.redirect('stores/users/' + req.params.id);            
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/users');
            }
        });
    });

    // Edit
    app.get('/stores/users/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_edit', res, (allowed) => {
            if (allowed) {
                fn.getAllUserClasses(req, res, (classes) => {
                    m.users.findOne({
                        attributes: ['user_id', '_bader', '_name', '_ini', '_rank', '_gender', '_status', '_reset', '_login_id', '_last_login'],
                        where: {
                            user_id: req.params.id
                        }
                    }).then((user) => {
                        if (!user) {
                            req.flash('danger', 'Error retrieving user!');
                            res.render('stores/users/' + req.params.id);
                        } else {
                            res.render('stores/users/edit', {
                                user:    user,
                                classes: classes
                            });
                        }
                    }).catch((err) => {
                        req.flash('danger', 'Error loading users!');
                        console.log(err);
                        res.redirect('stores/users/' + req.params.id);
                    });
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/users');
            }
        });
    });

    // Put
    app.put('/stores/users/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_edit', res, (allowed) => {
            if (allowed) {
                if (!req.body.user._reset) {req.body.user._reset = 0}
                m.users.update(
                    req.body.user
                    ,{
                        where: {user_id: req.params.id}
                    }
                ).then((user) => {
                    req.flash('success', 'User edited!');
                    res.redirect('/stores/users/' + req.params.id)
                }).catch((err) => {
                    req.flash('danger', 'Error editing user!');
                    console.log(err);
                    res.redirect('/stores/users/' + req.params.id);            
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/users');
            }
        });
    });

    // Delete
    app.delete('/stores/users/:id', mw.isLoggedIn, (req, res) => {
        if (req.user.user_id !== Number(req.params.id)) {
            fn.allowed('users_delete', res, (allowed) => {
                fn.delete(allowed, m.users, {user_id: req.params.id}, req, (result) => {
                    fn.delete(allowed, m.permissions, {user_id: req.params.id}, req, (result) => {
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
        fn.allowed('access_users', res, (allowed) => {
            if (allowed || req.user.user_id === Number(req.params.id)) {
                m.users.findOne({
                    where: {user_id: req.params.id},
                    include: [m.ranks, m.statuses, m.genders, m.permissions]
                }).then((user) => {
                    if (!user) {
                        req.flash('danger', 'Error loading users!');
                    } else {
                        fn.getNotes('users', req.params.id, req, (notes) => {
                            res.render('stores/users/show', {
                                user:            user, 
                                notes:           notes
                            });
                        });
                    };
                }).catch((err) => {
                    req.flash('danger', 'Error finding user!');
                    console.log(err);
                    res.redirect('/stores');
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/users');
            }
        });
    });
}