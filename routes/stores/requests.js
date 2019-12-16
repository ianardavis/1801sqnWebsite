const mw = {},
      fn = {},
      op = require('sequelize').Op;

module.exports = (app, m, allowed) => {
    require("../../db/functions")(fn, m);
    require('../../config/middleware')(mw, fn);
    //New Form
    app.get('/stores/requests/new', mw.isLoggedIn, allowed('requests_add', false, fn.getOne, m.permissions), (req, res) => {
        if (req.query.user) {
            if (req.allowed || Number(req.query.user) === req.user.user_id) {
                fn.getOne(
                    m.users,
                    {user_id: req.query.user},
                    [m.ranks]
                )
                .then(user => {
                    if (user.status_id === 1) {
                        res.render('stores/requests/new', {
                            user: user
                        }); 
                    } else {
                        req.flash('danger', 'Requests can only be made for current users')
                        res.redirect('/stores/users/' + req.query.user);
                    };
                })
                .catch(err => {
                    fn.error(err, '/stores/users' + req.query.user, req, res);
                });
            } else {
                req.flash('danger', 'Permission Denied!');
                res.redirect('/stores/users/' + req.query.user);
            };
        } else {
            req.flash('danger', 'No user specified!');
            res.redirect('/stores/users');
        };
    });

    //New Logic
    app.post('/stores/requests', mw.isLoggedIn, allowed('requests_add', false, fn.getOne, m.permissions), (req, res) => {
        if (req.allowed || Number(req.body.requested_for) === req.user.user_id) {
            if (req.body.selected) {
                fn.createRequest(
                    req.body.requested_for,
                    req.body.selected,
                    req.user.user_id
                )
                .then(request_id => {
                    req.flash('success', 'Request added');
                    res.redirect('/stores/users/' + req.body.requested_for);
                })
                .catch(err => {
                    fn.error(err, '/stores/users/' + req.body.requested_for, req, res);
                });
            } else {
                req.flash('info', 'No items selected!');
                res.redirect('/stores/users');
            };
        } else {
            req.flash('danger', 'Permission Denied!');
            res.redirect('/stores');
        };
    });

    //delete
    app.delete('/stores/requests/:id', mw.isLoggedIn, allowed('requests_delete', true, fn.getOne, m.permissions), (req, res) => {
        if (req.query.user) {
            fn.delete(
                m.requests_l,
                {request_id: req.params.id}
            )
            .then(line_result => {
                fn.delete(
                    m.requests,
                    {request_id: req.params.id}
                )
                .then(request_result => {
                    res.redirect('/stores/requests');
                })
                .catch(err => {
                    fn.error(err, '/stores/requests', req, res);
                });
            })
            .catch(err => {
                fn.error(err, '/stores/requests', req, res);
            });
        };
    });

    //Approve/Decline
    app.put('/stores/requests/:id/approval', mw.isLoggedIn, allowed('requests_approve', true, fn.getOne, m.permissions), (req, res) => {
        fn.processRequests(
            req.body,
            req.user.user_id
        )
        .then(noNSNs => {
            noNSNs.forEach(line_id => {
                req.flash('danger', 'Can not issue line ' + line_id + ', no NSNs available');
            });
            req.flash('success', 'Requests processed')
            res.redirect('/stores/requests');
        })
        .catch(err => {
            fn.error(err, '/stores/requests', req, res);
        });
    });

    //Index
    app.get('/stores/requests', mw.isLoggedIn, allowed('access_requests', false, fn.getOne, m.permissions), (req, res) => {
        var query = {},
            where = {};
        query.cr = Number(req.query.cr) || 2;
        if (query.cr === 2) {
            where._complete = 0;
        } else if (query.cr === 3) {
            where._complete = 1;
        };
        if (req.allowed === false) where.requested_for = req.user.user_id
        fn.getAllWhere(
            m.requests,
            where,
            [
                {
                    model: m.requests_l,
                    as: 'lines'
                },
                fn.users('_for')
            ]
        )
        .then(requests => {
            res.render('stores/requests/index',{
                requests: requests,
                query:    query
            });
        })
        .catch(err => {
            fn.error(err, '/stores', req, res);
        });
    });

    //Show
    app.get('/stores/requests/:id', mw.isLoggedIn, allowed('requests_approve', false, fn.getOne, m.permissions), (req, res) => {
        var query = {},
            where = {};
        query.sn = Number(req.query.sn) || 2;
        if (query.cr === 2) {
            where._status = 'Pending'
        } else if (query.cr === 3) {
            where._status = {[op.not]: 'Pending'}
        };
        if (req.query.sb === 'request') {
            fn.getOne(
                m.requests,
                {request_id: req.params.id},
                [
                    {
                        model: m.requests_l,
                        where: where,
                        as: 'lines',
                        include: [
                            fn.item_sizes(true, true, true),
                            fn.users(),
                            m.orders,
                            m.issues
                        ]
                    },
                    fn.users('_for'),
                    fn.users('_by')
                ]
            )
            .then(request => {
                if (req.allowed || request._for.user_id === req.user.user_id) {
                    fn.getNotes('requests', req.params.id, req, res)
                    .then(notes => {
                        res.render('stores/requests/show', 
                            {
                                sortBy:  'request',
                                sortID:  request.request_id,
                                request: request,
                                notes:   notes,
                                query:   query
                            }
                        );
                    });
                } else {
                    req.flash('danger', 'Permission Denied!')
                    res.redirect('/stores/requests');
                };
            })
            .catch(err => {
                fn.error(err, '/stores/requests', req, res);
            });
        } else if (req.query.sb === 'user') {
            if (req.allowed || req.params.id === req.user.user_id) {
                fn.getAllWhere(
                    m.requests_l,
                    where,
                    [
                        {
                            model: m.requests,
                            where: {requested_for: req.params.id}
                        },
                        fn.item_sizes(true, true, true),
                        fn.users(),
                        m.orders,
                        m.issues
                    ]
                )
                .then(requests => {
                    fn.getOne(
                        m.users,
                        {user_id: req.params.id},
                        [m.ranks]
                    )
                    .then(user => {
                        res.render('stores/requests/show',
                            {
                                sortBy:   'user',
                                sortID:   user.user_id,
                                f_user:   user,
                                requests: requests,
                                query:    query
                            }
                        );
                    })
                    .catch(err => {
                        fn.error(err, '/stores/requests', req, res);
                    });
                })
                .catch(err => {
                    fn.error(err, '/stores/requests', req, res);
                });
            } else {
                req.flash('danger', 'Permission Denied!')
                res.redirect('/stores/requests');
            };
        } else {
            req.flash('danger', 'No display criteria specified');
            res.redirect('/stores/requests');
        };
    });
};