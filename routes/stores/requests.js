const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions"),
        cn = require("../../db/constructors");
        
module.exports = (app, m) => { 
    //New Form
    app.get('/stores/requests/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('requests_add', false, req, res, (allowed) => {
            if (req.query.user) {
                fn.getUser(req.query.user, {include: false}, req, (user) => {
                    if (user) {
                        if (allowed || Number(req.query.user) === req.user.user_id) {
                            if (user.status.status_id !== 1) {
                                req.flash('danger', 'Requests can only be made for current users')
                                res.redirect('/stores/users/' + req.query.user);
                            } else {
                                res.render('stores/requests/new', {
                                    selectedUser: user
                                }); 
                            };
                        } else {
                            req.flash('danger', 'Permission Denied!');
                            res.redirect('/stores/users/' + req.query.user);
                        };
                    } else {
                        res.redirect('/stores/users')
                    };
                });
            } else {
                req.flash('danger', 'No user specified!');
                res.redirect('/stores/users');
            };
        });
    });
    //New Logic
    app.post('/stores/requests', mw.isLoggedIn, (req, res) => {
        fn.allowed('requests_add', false, req, res, (allowed) => {
            if (req.body.selected) {
                if (allowed || Number(req.body.requested_for) === req.user.user_id) {
                    var requests = [];
                    req.body.selected.map((item) => {
                        if (item) {
                            item = JSON.parse(item);
                            var request = new cn.Request(req.body.requested_for, item, req.user.user_id);
                            requests.push(fn.requestLine(request));
                        };
                    });
                    if (requests.length > 0) {
                        Promise.all(requests)
                        .then(results => {
                            fn.processPromiseResult(results, req, (then) => {
                                res.redirect('/stores/users/' + req.body.requested_for);
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.redirect('/stores/users/' + req.body.requested_for);
                        });
                    } else {
                        res.redirect('/stores/users/' + req.body.requested_for);
                    };
                } else {
                    req.flash('danger', 'Permission Denied!');
                    res.redirect('back');
                };
                
            } else {
                req.flash('info', 'No items selected!');
                res.redirect('/stores/users');
            };
        });
    });

    //Index
    app.get('/stores/requests', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_requests', true, req, res, (allowed) => {
            fn.getAllRequests(req.query.complete ,req, (requests) => {
                res.render('stores/requests/index',{
                    requests: requests,
                    query:  req.query
                });
            });
        });
    });

    //Show
    app.get('/stores/requests/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_requests', false, req, res, (allowed) => {
            fn.getRequest(req.params.id, req, (request) => {
                if (allowed || request.requestedFor.user_id === req.user.user_id) {
                    fn.getNotes('requests', req.params.id, req, res, (notes) => {
                        res.render('stores/requests/show',{
                            request: request,
                            notes: notes
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