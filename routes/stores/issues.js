const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");
        cn = require("../../db/constructors");
var currentLine;

module.exports = (app, m) => {
    //userlist
    app.get('/stores/issues/userlist', mw.isLoggedIn, (req, res) => {
       fn.allowed('access_issues', true, req, res, (allowed) => {
            var q_status = Number(req.query.status) || 1,
                whereObj = {
                    user_id: {[op.not]: 1},
                    status_id: q_status
                };                
            fn.getAllUsersWhere(whereObj, req, (users) => {
                fn.getAllWhere(m.statuses, {status_id: {[op.not]: 4}},req, (statuses) => {
                    res.render('stores/issues/user_list', {
                        users:    users,
                        statuses: statuses,
                        status:   q_status
                    });
                });
            });
        });
    });
    
    // index
    app.get('/stores/issues', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_issues', false, req, res, (allowed) => {
            if (Number.isInteger(Number(req.query.user))) {
                if (allowed || Number(req.query.user) === Number(req.user.user_id)) {
                    var whereObj = {issued_to: req.query.user},
                        returned = Number(req.query.returned) || 2;
                    if (returned === 2) {
                        whereObj.returned_to = null
                    } else if (returned === 3) {
                        whereObj.returned_to = {[op.not]: null}
                    };
                    fn.getIssuesForUser(whereObj, req, (issues) => {
                        fn.getUser(req.query.user, req, (user) => {
                            res.render('stores/issues/index', {
                                selectedUser: user,
                                returned: returned,
                                issues:   issues
                            });
                        });
                    });
                } else {
                    req.flash('danger', 'Permission Denied!');
                    res.redirect('/stores/issues/userlist');
                };   
            } else {
                req.flash('danger', 'No issue specified!');
                res.redirect('/stores/issues/userlist');
            }                      
        });
    });

    app.post('/stores/issues', mw.isLoggedIn, (req, res) => {
        fn.allowed('issues_add', true, req, res, (allowed) => {
            if (req.body.selected) {
                currentLine = fn.counter();
                fn.createLoanCard(req.body.issue.issued_to, req.user.user_id, (loancard_id) => {
                    var lines = [];
                    req.body.selected.map((item) => {
                        if (item) {
                            item = JSON.parse(item);
                            var issue = new Issue(req.body.issue, item, req.user.user_id);
                            lines.push(fn.issueLine(issue, item, loancard_id))
                        };
                    });
                    if (lines.length > 0) {
                        Promise.all(lines)
                        .then(results => {
                            fn.processPromiseResult(results, req, (then) => {
                                res.redirect('/stores/issues?user=' + req.body.issue.issued_to);
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.redirect('/stores/issues?user=' + req.body.issue.issued_to);
                        });
                    } else {
                        fn.deleteLoanCard(loancard_id, (result) => {
                            res.redirect('/stores/issues?user=' + req.body.issue.issued_to);
                        });
                    };
                });
                
            } else {
                req.flash('info', 'No items selected!');
                res.redirect('/stores/issues?user=' + req.body.issue.issued_to);
            };
        });
    });

    //new form
    app.get('/stores/issues/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('issues_add', true, req, res, (allowed) => {
            if (req.query.user) {
                if (req.query.user !== req.user.user_id) {
                    fn.getUser(req.query.user, req, (user) => {
                        if (user.status.status_id !== 1) {
                            req.flash('danger', 'Issues can only be made to current users')
                            res.redirect('/stores/issues/userlist');
                        } else {
                            if (items) {
                                res.render('stores/issues/new', {
                                    selectedUser: user
                                }); 
                            } else {
                                req.flash('danger', 'No items found'),
                                res.redirect('/stores/issues?user=' + req.query.user)
                            };
                        };
                    });
                } else {
                    res.redirect('/stores/issues?user=' + req.query.user);
                };
            } else {
                req.flash('danger', 'No user specified!');
                res.redirect('/stores/issues/userlist');
            };
        });
    });

    //Return
    app.put('/stores/issues', mw.isLoggedIn, (req, res) => {
        fn.allowed('issues_return', true, req, res, (allowed) => {
            var lines = [];
            if (req.body.locations) {
                req.body.locations.map((line) => {
                    if (line) {
                        lines.push(returnLine(line, req.user.user_id))
                    };
                });
                if (lines.length > 0) {
                    Promise.all(lines)
                    .then(results => {
                        var dangerFlash  = [],
                            successFlash = [],
                            errors       = [];
                        results.forEach((result) => {
                            if (result !== 'null') {
                                if (result.flash_type === 'danger') {
                                    dangerFlash.push(result.flash_message);
                                } else if (result.flash_type === 'success') {
                                    successFlash.push(result.flash_message);
                                };
                                if (result.error !== null) {
                                    errors.push(result.error);
                                };
                            };
                        });
                        if (dangerFlash.length !== 0) {
                            req.flash('danger', dangerFlash.join('<br>'));
                        };
                        if (successFlash.length !== 0) {
                            req.flash('success', successFlash.join('<br>'));
                        };
                        if (errors.length !== 0) {
                            errors.forEach((err) => {
                                console.log(err);
                            });
                        };
                        res.redirect('/stores/issues?user=' + req.body.selectedUser);
                    })
                    .catch(err => {
                        console.log(err);
                        res.redirect('/stores/issues?user=' + req.body.selectedUser);
                    });
                } else {
                    res.redirect('/stores/issues?user=' + req.body.selectedUser);
                };
            } else {
                res.redirect('/stores/issues?user=' + req.body.selectedUser);
            };
        });
    });

    //delete
    app.delete('/stores/issues/id', mw.isLoggedIn, (req, res) => {
        if (req.query.user) {
            fn.allowed('issues_delete', true, res, (allowed) => {
                fn.delete(m.issues, {issue_id: req.params.id}, req, (result) => {
                    if (!result) req.flash('danger', 'Error deleting record');
                    res.redirect('/stores/issues?user=' + req.query.user)
                });
            });
        };
    });

    //show
    app.get('/stores/issues/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_issues', false, req, res, (allowed) => {
            fn.getIssue(req.params.id, req, (issue) => {
                if (allowed || issue.issued_to.user_id === req.user.user_id) {
                    fn.getNotes('issues', req.params.id, req, (notes) => {
                        res.render('stores/issues/show', {
                                issue: issue,
                                notes: notes
                        })
                    });
                } else {
                    res.redirect('/stores/userlist');
                }; 
            });
        });
    });
};