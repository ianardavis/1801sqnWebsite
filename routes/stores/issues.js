const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions"),
        cn = require("../../db/constructors");
var currentLine;

module.exports = (app, m) => {
    // Index
    app.get('/stores/issues', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_issues', true, req, res, (allowed) => {
            var query = {};
            query.ci = Number(req.query.ci) || 2;
            fn.getAllIssues(query, false, req, (issues) => {
                res.render('stores/issues/index', {
                    query:  query,
                    issues: issues
                });
            });
        });
    });

    //Return
    app.put('/stores/issues', mw.isLoggedIn, (req, res) => {
        fn.allowed('issues_return', true, req, res, (allowed) => {
            var source = req.query.source || '/stores/issues',
                lines = [];
            if (req.body.lines) {
                req.body.lines.map((line) => {
                    if (line) {
                        line = JSON.parse(line);
                        lines.push(fn.updateLocationQty(line.location_id, line.qty, '+'));
                        lines.push(fn.returnLine(line, req.user.user_id));
                    };
                });
                if (lines.length > 0) {
                    Promise.all(lines)
                    .then(results => {
                        fn.closeIssueIfAllReturned(req.body.issue_id).then(checkResults => {
                            fn.processPromiseResult(
                                results.concat(checkResults), 
                                req, 
                                (next) => {
                                res.redirect(source);
                            });
                        })
                        .catch(err => {
                            console.log(err);
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

    //New Logic
    app.post('/stores/issues', mw.isLoggedIn, (req, res) => {
        fn.allowed('issues_add', true, req, res, (allowed) => {
            if (req.body.selected) {
                var newIssue = new cn.Issue(req.body.issue, req.user.user_id);
                fn.create(m.issues, newIssue, req, (issue) => {
                    if (issue) {
                        currentLine = fn.counter();
                        var issues = [];
                        req.body.selected.map((item) => {
                            if (item) {
                                item = JSON.parse(item);
                                var line = new cn.IssueLine(issue.issue_id, item, currentLine());
                                issues.push(fn.updateLocationQty(item.location_id, item._qty, '-'));
                                issues.push(fn.issueLine(line));
                            };
                        });
                        if (issues.length > 0) {
                            Promise.all(issues)
                            .then(results => {
                                fn.processPromiseResult(results, req, (then) => {
                                    if (currentLine() === 1) {
                                        fn.delete(m.issues, {issue_id: issue.issue_id}, req, (next) => {
                                            res.redirect('/stores/users/' + issue.issued_to);
                                        });
                                    } else {
                                        res.redirect('/stores/users/' + issue.issued_to);
                                    }
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.redirect('/stores/users/' + issue.issued_to);
                            });
                        } else {
                            res.redirect('/stores/users/' + issue.issued_to);
                        };
                    } else {
                        res.redirect('/stores/issues');
                    };
                });
            } else {
                req.flash('info', 'No items selected!');
                res.redirect('/stores/issues');
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
                            if (user.status_id !== 1) {
                                req.flash('danger', 'Issues can only be made to current users')
                                res.redirect('/stores/users/' + req.query.user);
                            } else {
                                res.render('stores/issues/new', {
                                    user: user
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

    //delete
    app.delete('/stores/issues/:id', mw.isLoggedIn, (req, res) => {
        if (req.query.user) {
            fn.allowed('issues_delete', true, req, res, (allowed) => {
                fn.delete(m.issues_l, {issue_id: req.params.id}, req, (line_result) => {
                    if (!line_result) req.flash('danger', 'No lines deleted');
                    fn.delete(m.issues, {issue_id: req.params.id}, req, (issue_result) => {
                        if (!issue_result) req.flash('danger', 'Error deleting issue');
                        res.redirect('/stores/issues');
                    });
                });
            });
        };
    });

    //show
    app.get('/stores/issues/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_issues', false, req, res, (allowed) => {
            var query = {};
            query.sn = Number(req.query.sn) || 2
            fn.getIssue(req.params.id, true, req, (issue) => {
                if (issue) {
                    if (allowed || issue.issuedTo.user_id === req.user.user_id) {
                        fn.getNotes('issues', req.params.id, req, res, (notes) => {
                            res.render('stores/issues/show', {
                                issue: issue,
                                notes: notes,
                                query: query
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