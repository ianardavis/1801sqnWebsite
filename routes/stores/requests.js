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
                    fn.getUser(req.query.user, {include: false}, req, user => {
                        if (user) {
                            if (user.status_id !== 1) {
                                req.flash('danger', 'Requests can only be made for current users')
                                res.redirect('/stores/users/' + req.query.user);
                            } else {
                                res.render('stores/requests/new', {
                                    user: user
                                }); 
                            };
                        } else {
                            res.redirect('/stores/users')
                        };
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
                var request = new cn.Request(req.user.user_id, req.body.requested_for);
                fn.create(m.requests, request, req, newRequest => {
                    var requests = [];
                    req.body.selected.map((item) => {
                        if (item) {
                            item = JSON.parse(item);
                            var line = new cn.RequestLine(newRequest.request_id, item);
                            requests.push(fn.requestLine(line));
                        };
                    });
                    if (requests.length > 0) {
                        Promise.all(requests)
                        .then(results => {
                            fn.processPromiseResult(results, req, then => {
                                res.redirect('/stores/users/' + req.body.requested_for);
                            });
                        })
                            .catch(err => {
                                console.log(err);
                                res.redirect('/stores/users/' + req.body.requested_for);
                            });
                        } else {
                            fn.delete(m.requests, {request_id: new_request.request_id}, req, next => {
                                res.redirect('/stores/users/' + req.body.requested_for);
                            });
                        };
                    });
                } else {
                    req.flash('info', 'No items selected!');
                    res.redirect('/stores/users');
                };
            } else {
                req.flash('danger', 'Permission Denied!');
                res.redirect('back');
            };
        });
    });

    //delete
    app.delete('/stores/requests/:id', mw.isLoggedIn, (req, res) => {
        if (req.query.user) {
            fn.allowed('requests_delete', true, req, res, (allowed) => {
                fn.delete(m.requests_l, {request_id: req.params.id}, req, (line_result) => {
                    if (!line_result) req.flash('danger', 'No lines deleted');
                    fn.delete(m.requests, {request_id: req.params.id}, req, (request_result) => {
                        if (!request_result) req.flash('danger', 'Error deleting request');
                        res.redirect('/stores/requests');
                    });
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
        fn.allowed('access_requests', true, req, res, (allowed) => {
            var query = {};
            query.cr = Number(req.query.cr) || 2;
            fn.getAllRequests(query, req, (requests) => {
                res.render('stores/requests/index',{
                    requests: requests,
                    query:    query
                });
            });
        });
    });

    //Show
    app.get('/stores/requests/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_requests', false, req, res, (allowed) => {
            var query = {};
            query.sn = Number(req.query.sn) || 2;
            fn.getRequest(query, req.params.id, req, (request) => {
                if (allowed || request.requestedFor.user_id === req.user.user_id) {
                    fn.getNotes('requests', req.params.id, req, res, (notes) => {
                        res.render('stores/requests/show',{
                            request: request,
                            notes:   notes,
                            query:   query
                        });
                    });
                } else {
                    req.flash('danger', 'Permission Denied!')
                    res.redirect('back');
                }; 
            });
        });
    });
};