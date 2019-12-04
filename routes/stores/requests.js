const mw = require('../../config/middleware'),
      fn = require("../../db/functions"),
      cn = require("../../db/constructors"),
      op = require('sequelize').Op;
var currentLine;

module.exports = (app, m) => { 
    //New Form
    app.get('/stores/requests/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('requests_add', false, req, res, allowed => {
            if (req.query.user) {
                if (allowed || Number(req.query.user) === req.user.user_id) {
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
    });

    //New Logic
    app.post('/stores/requests', mw.isLoggedIn, (req, res) => {
        fn.allowed('requests_add', false, req, res, allowed => {
            if (allowed || Number(req.body.requested_for) === req.user.user_id) {
                if (req.body.selected) {
                    var newRequest = new cn.Request(req.user.user_id, req.body.requested_for);
                    fn.create(
                        m.requests,
                        newRequest
                    )
                    .then(request => {
                        var actions = [];
                        req.body.selected.map((item) => {
                            if (item) {
                                item = JSON.parse(item);

                                var line = new cn.RequestLine(request.request_id, item);
                                actions.push(fn.create(m.requests_l, line));
                            };
                        });
                        if (actions.length > 0) {
                            Promise.all(actions)
                            .then(results => {
                                req.flash('success', 'Request added')
                                res.redirect('/stores/users/' + req.body.requested_for);
                            })
                            .catch(err => {
                                fn.error(err, '/stores/users/' + req.body.requested_for, req, res);
                            });
                        } else {
                            fn.delete(
                                m.requests,
                                {request_id: request.request_id}
                            )
                            .then(next => {
                                res.redirect('/stores/users/' + req.body.requested_for);
                            })
                            .catch(err =>{
                                fn.error(err, '/stores/users/' + req.body.requested_for, req, res);
                            });
                        };
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
    });

    //delete
    app.delete('/stores/requests/:id', mw.isLoggedIn, (req, res) => {
        if (req.query.user) {
            fn.allowed('requests_delete', true, req, res, (allowed) => {
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
            });
        };
    });

    //Approve/Decline
    app.put('/stores/requests/:id/approval', mw.isLoggedIn, (req, res) => {
        fn.allowed('requests_approve', true, req, res, allowed => {
            fn.processRequests(req, res);
        });
    });

    //Index
    app.get('/stores/requests', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_requests', false, req, res, allowed => {
            var query = {},
                where = {};
            query.cr = Number(req.query.cr) || 2;
            if (query.cr === 2) {
                where._complete = 0;
            } else if (query.cr === 3) {
                where._complete = 1;
            };
            if (allowed === false) where.requested_for = req.user.user_id
            fn.getAllWhere(
                m.requests,
                where,
                [
                    {
                        model: m.requests_l,
                        as: 'lines'
                    },
                    fn.users('requestedFor')
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
    });

    //Show
    app.get('/stores/requests/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_requests', false, req, res, (allowed) => {
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
                        fn.users('requestedFor'),
                        fn.users('requestedBy')
                    ]
                )
                .then(request => {
                    if (allowed || request.requestedFor.user_id === req.user.user_id) {
                        fn.getNotes('requests', req.params.id, req, res)
                        .then(notes => {
                            res.render('stores/requests/show',{
                                sortBy:  'request',
                                sortID:  request.request_id,
                                request: request,
                                notes:   notes,
                                query:   query
                            });
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
                if (allowed || req.params.id === req.user.user_id) {
                    fn.getOne(
                        m.users,
                        {user_id: req.params.id},
                        [m.ranks]
                    )
                    .then(user => {
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
                            res.render('stores/requests/show',{
                                sortBy:   'user',
                                sortID:   user.user_id,
                                f_user:   user,
                                requests: requests,
                                query:    query
                            });
                        })
                        .catch(err => {
                            fn.error(err, '/stores/requests', req, res);
                        });
                    })
                    .catch(err => {

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
    });
};