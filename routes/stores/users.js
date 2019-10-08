const   mw  = require('../../config/middleware');
        pm  = require('../../config/permissions')
module.exports = (app, users, notes, options, permissions) => {
    // Index
    app.get('/stores/users', mw.isLoggedIn, (req, res) => {
        var statuses;
        var whereObj = {}
        var query = req.query.status;
        if (!query) {query='current'};
        whereObj._status = query
        pm.allowed('access_users', req.user.user_id, (allowed) => {
            if (allowed === false) {
                whereObj.user_id = req.user.user_id
            }
            getOptions('_status', (stats) => {
                statuses = stats
                users.findAll({
                    attributes: ['user_id', '_bader', '_name', '_ini', '_rank', '_status'],
                    where: whereObj
                }).then((user_list) => {
                    res.render('stores/users/index', {users: user_list, statuses: statuses, status: query});
                }).catch((err) => {
                    req.flash('danger', 'Error loading users!')
                    console.log(err);
                    res.redirect('/stores');
                });
            });
        });
    });

    // New Logic
    app.post('/stores/users', mw.isLoggedIn, (req, res) => {
        pm.allowed('users_add', req.user.user_id, (allowed) => {
            if (allowed === true) {
                var user    = req.body,
                bCrypt  = require('bcrypt'),
                salt    = bCrypt.genSaltSync(10),
                encPassword = bCrypt.hashSync(user._password, salt);
            users.create({
                _bader: user._bader,
                _name: user._name,
                _ini: user._ini,
                _rank: user._rank,
                _gender: user._gender,
                _status: user._status,
                _login_id: user._login_id,
                _password: encPassword,
                _salt: salt
            }).then((user) => {
                if (user) {
                    permissions.create({
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
        pm.allowed('users_add', req.user.user_id, (allowed) => {
            if (allowed === true) {
                var ranks
                var genders
                var statuses
                getOptions('_rank', (rnks) => {
                    ranks = rnks
                    getOptions('_gender', (gend) => {
                        genders = gend
                        getOptions('_status', (stats) => {
                            statuses = stats
                            res.render('stores/users/new', {ranks: ranks, genders: genders, statuses: statuses});
                        });
                    });
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/users');
            }
        });
    });

    // change password
    app.get('/stores/password/:id', mw.isLoggedIn, (req, res) => {
        pm.allowed('users_password', req.user.user_id, (allowed) => {
            if (allowed === true || req.user.user_id === Number(req.params.id)) {
                users.findOne({
                attributes: ['user_id', '_bader', '_name', '_ini', '_rank', '_gender', '_status', '_reset', '_login_id', '_last_login'],
                where: {
                    user_id: req.params.id
                }
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

    // Put change password
    app.put('/stores/password/:id', mw.isLoggedIn, (req, res) => {
        pm.allowed('users_password', req.user.user_id, (allowed) => {
            if (allowed === true || req.user.user_id === Number(req.params.id)) {
                var user        = req.body,
                    bCrypt      = require('bcrypt'),
                    salt        = bCrypt.genSaltSync(10),
                    encPassword = bCrypt.hashSync(user._password, salt);
                users.update(
                    {
                        _password: encPassword,
                        _salt: salt
                    },{
                        where: {user_id: req.params.id}
                    }
                ).then((user) => {
                    req.flash('insuccessfo', 'Password changed');
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
        pm.allowed('users_edit', req.user.user_id, (allowed) => {
            if (allowed === true) {
                var ranks
                var genders
                var statuses
                getOptions('_rank', (rnks) => {
                    ranks = rnks
                    getOptions('_gender', (gend) => {
                        genders = gend
                        getOptions('_status', (stats) => {
                            statuses = stats
                            users.findOne({
                                attributes: ['user_id', '_bader', '_name', '_ini', '_rank', '_gender', '_status', '_reset', '_login_id', '_last_login'],
                                where: {
                                    user_id: req.params.id
                                }
                            }).then((user) => {
                                if (!user) {
                                    req.flash('danger', 'Error retrieving user!');
                                    res.render('stores/users/' + req.params.id);
                                } else {
                                    res.render('stores/users/edit', {user: user, ranks: ranks, genders: genders, statuses: statuses});
                                }
                            }).catch((err) => {
                                req.flash('danger', 'Error loading users!');
                                console.log(err);
                                res.redirect('stores/users/' + req.params.id);
                            });
                        });
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
        pm.allowed('users_edit', req.user.user_id, (allowed) => {
            if (allowed === true) {
                var user = req.body;
                users.update(
                    {
                        _bader: user._bader,
                        _name: user._name,
                        _ini: user._ini,
                        _rank: user._rank,
                        _gender: user._gender,
                        _status: user._status,
                        _login_id: user._login_id
                    },{
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
        pm.allowed('users_delete', req.user.user_id, (allowed) => {
            if (allowed === true && !(req.user.user_id === Number(req.params.id))) {
                users.destroy({
                    where: {user_id: req.params.id}
                }).then((results) => {
                    permissions.destroy({
                        where: {user_id: req.params.id}
                    }).then((results) => {
                        req.flash('success', 'User deleted!');
                        res.redirect('/stores/users');
                    }).catch((err) => {
                        req.flash('danger', 'Error deleting user permissions!');
                        res.redirect('/stores/users');
                    })
                }).catch((err) => {
                    req.flash('danger', 'Error deleting user!');
                    res.redirect('/stores/users');
                })
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/users/' + req.params.id);
            }
        });
    });

    // Show
    app.get('/stores/users/:id', mw.isLoggedIn, (req, res) => {
        pm.allowed('access_users', req.user.user_id, (allowed) => {
            if (allowed === true || req.user.user_id === Number(req.params.id)) {
                users.findOne({
                    attributes: ['user_id', '_bader', '_name', '_ini', '_rank', '_gender', '_status', '_reset', '_login_id', '_last_login'],
                    where: {user_id: req.params.id}
                }).then((user) => {
                    if (!user) {
                        req.flash('danger', 'Error loading users!');
                    } else {  
                        notes.findAll({
                            attributes: ['note_id', '_note', '_date', '_system'],
                            where: {
                                _link_table: 'users',
                                _link_value: req.params.id
                            }
                        }).then((notes_list) => {
                            permissions.findOne({
                                where: {
                                    user_id: req.params.id
                                }
                            }).then((perms) => {
                                res.render('stores/users/show', {user: user, notes: notes_list, permissions: perms});
                            })
                        }).catch((err) => {
                            req.flash('danger', 'Error loading users!');
                            console.log(err);
                            res.redirect('/stores/users');
                        });
                    };
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/users');
            }
        });
    });

    function getOptions (Field, cb) {
        var res = []
        options.findAll({
            attributes: ['_option'],
            where: {
                _combo: Field
            }
        }).then((results) => {
            if (!results.length) cb(res);
                results.forEach((opt) => {
                    res.push(opt._option);
                })
            cb(res);
        }).catch((err) => {
            req.flash('danger', 'Failed to load ' + Field + '!');
            console.log(err);
            cb(res);
        });
    };
}