const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions"),
        cn = require("../../db/constructors");

module.exports = (app, m) => {    
    // Index
    app.get('/stores/issues', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_issues', true, req, res, (allowed) => {
            var whereObj = {},
                returned = Number(req.query.returned) || 2;
            if (returned === 2) {
                whereObj.returned_to = null
            } else if (returned === 3) {
                whereObj.returned_to = {[op.not]: null}
            };
            fn.getIssuesWhere(whereObj, req, (issues) => {
                res.render('stores/issues/index', {
                    returned: returned,
                    issues:   issues
                });
            });
        });
    });

    //New Logic
    app.post('/stores/issues', mw.isLoggedIn, (req, res) => {
        fn.allowed('issues_add', true, req, res, (allowed) => {
            if (req.body.selected) {
                currentLine = fn.counter();
                fn.createLoanCard(req.body.issue.issued_to, req.user.user_id, (loancard_id) => {
                    var issues = [];
                    req.body.selected.map((item) => {
                        if (item) {
                            item = JSON.parse(item);
                            var issue = new cn.Issue(req.body.issue, item, req.user.user_id);
                            issues.push(fn.issueLine(issue, item, loancard_id))
                        };
                    });
                    if (issues.length > 0) {
                        Promise.all(issues)
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
                fn.getUser(req.query.user, {include: false}, req, (user) => {
                    if (user) {
                        if (req.query.user !== req.user.user_id) {
                            if (user.status.status_id !== 1) {
                                req.flash('danger', 'Issues can only be made to current users')
                                res.redirect('/stores/users/' + req.query.user);
                            } else {
                                res.render('stores/issues/new', {
                                    selectedUser: user
                                }); 
                            };
                        } else {
                            req.flash('info', 'You can not issue to yourself!');
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

    //Return
    app.put('/stores/issues', mw.isLoggedIn, (req, res) => {
        fn.allowed('issues_return', true, req, res, (allowed) => {
            var source = req.query.source || '/stores/issues';
            var lines = [];
            if (req.body.locations) {
                req.body.locations.map((line) => {
                    if (line) {
                        lines.push(fn.returnLine(line, req.user.user_id))
                    };
                });
                if (lines.length > 0) {
                    Promise.all(lines)
                    .then(results => {
                        fn.processPromiseResult(
                            results, 
                            req, 
                            (complete) => {
                            res.redirect(source);
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.redirect(source);
                    });
                } else {
                    res.redirect(source);
                };
            } else {
                res.redirect(source);
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
                if (issue) {
                    if (allowed || issue.issuedTo.user_id === req.user.user_id) {
                        fn.getNotes('issues', req.params.id, req, res, (notes) => {
                            res.render('stores/issues/show', {
                                    issue: issue,
                                    notes: notes
                            })
                        });
                    } else {
                        req.flash('danger', 'Permission Denied!')
                        res.redirect('back');
                    }; 
                } else {
                    res.redirect('/stores/issues');
                };
            });
        });
    });
};