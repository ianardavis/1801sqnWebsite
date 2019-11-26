const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions"),
        cn = require("../../db/constructors");
var currentLine;

module.exports = (app, m) => {
    // Index
    app.get('/stores/issues', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_issues', true, req, res, (allowed) => {
            var query = {},
                where = {};
            query.ci = Number(req.query.ci) || 2;
            if (query.ci === 2) {
                where._complete = 0;
            } else if (query.ci === 3) {
                where._complete = 1;
            };
            fn.getAllWhere(
                m.issues, 
                where, 
                [
        			fn.users('issuedTo'),
        			fn.users('issuedBy'),
					{
						model: m.issues_l,
						as: 'lines'
					}
				]
            )
            .then(issues => {
                res.render('stores/issues/index', {
                    query:  query,
                    issues: issues
                });
            })
            .catch(err => {
                fn.error(err, '/stores', req, res);
            });
        });
    });

    //Return
    app.put('/stores/issues', mw.isLoggedIn, (req, res) => {
        fn.allowed('issues_return', true, req, res, allowed => {
            var source = req.query.source || '/stores/issues',
                lines = [];
            if (req.body.lines) {
                req.body.lines.map(line => {
                    if (line) {
                        line = JSON.parse(line);
                        lines.push(fn.addStock(line.stock_id, line.qty));
                        lines.push(fn.returnLine(line, req.user.user_id));
                    };
                });
                if (lines.length > 0) {
                    Promise.all(lines)
                    .then(results => {
                        fn.closeIfNoLines(
                            m.issues, 
                            m.issues_l,
                            {issue_id: issue_id},
                            {_date_returned: null}
                        )
                        .then(result => {
                            req.flash('success', 'Lines returned');
                            res.redirect(source);
                        })
                        .catch(err => {
                            fn.error(err, source, req, res);
                        });
                    })
                    .catch(err => {
                        fn.error(err, source, req, res);
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
        fn.allowed('issues_add', true, req, res, allowed => {
            if (req.body.selected) {
                var newIssue = new cn.Issue(req.body.issue, req.user.user_id);
                fn.create(
                    m.issues,
                    newIssue
                )
                .then(issue => {
                    currentLine = fn.counter();
                    var actions = [];
                    req.body.selected.map(item => {
                        if (item) {
                            item = JSON.parse(item);
                            var line = new cn.IssueLine(issue.issue_id, item, currentLine());
                            actions.push(fn.subtractStock(item.stock_id, item._qty));
                            actions.push(fn.create(m.issues_l, line));
                        };
                    });
                    if (actions.length > 0) {
                        Promise.all(actions)
                        .then(results => {
                            if (currentLine() === 1) {
                                fn.delete(m.issues, {issue_id: issue.issue_id}, req, next => {
                                    res.redirect('/stores/users/' + issue.issued_to);
                                });
                            } else {
                                fn.createLoanCard(
                                    issue.issue_id
                                )
                                .then(result => {
                                    res.redirect('/stores/users/' + issue.issued_to);
                                })
                                .catch(err => {
                                    fn.error(err, '/stores/issues/' + issue.issue_id, req, res);
                                });
                                
                            };
                        })
                        .catch(err => {
                            fn.error(err, '/stores/users/' + issue.issued_to, req, res);
                        });
                    } else {
                        res.redirect('/stores/users/' + issue.issued_to);
                    };
                })
                .catch(err => {
                    fn.error(err, '/stores/issues', req, res);
                });
            } else {
                req.flash('info', 'No items selected!');
                res.redirect('/stores/issues');
            };
        });
    });

    //new form
    app.get('/stores/issues/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('issues_add', true, req, res, allowed => {
            if (req.query.user) {
                fn.getOne(
                    m.users,
                    {user_id: req.query.user},
                    [m.ranks]
                )
                .then(user => {
                    if (req.query.user !== req.user.user_id) {
                        if (user.status_id === 1) {
                            res.render('stores/issues/new', {
                                user: user
                            }); 
                        } else {
                            req.flash('danger', 'Issues can only be made to current users')
                            res.redirect('/stores/users/' + req.query.user);
                        };
                    } else {
                        req.flash('info', 'You can not issue to yourself');
                        res.redirect('/stores/users/' + req.query.user);
                    };
                })
                .catch(err => {
                    fn.error(err, '/stores/users', req, res);
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
            fn.allowed('issues_delete', true, req, res, allowed => {
                var actions = [];
                actions.push(fn.delete(m.issues_l,{issue_id: req.params.id}));
                actions.push(fn.delete(m.issues, {issue_id: req.params.id}));
                Promise.all(
                    actions
                )
                .then(results => {
                    req.flash('success', 'Issue deleted');
                    res.redirect('/stores/issues');
                })
                .catch(err => {
                    fn.error(err, '/stores/issues', req, res);
                });
            });
        };
    });

    //show
    app.get('/stores/issues/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_issues', false, req, res, allowed => {
            var query = {};
            query.sn = Number(req.query.sn) || 2
            fn.getOne(
                m.issues, 
                {issue_id: req.params.id}, 
                fn.issuesInclude(true)
            )
            .then(issue => {
                if (allowed || issue.issuedTo.user_id === req.user.user_id) {
                    fn.getNotes('issues', req.params.id, req, res)
                    .then(notes => {
                        res.render('stores/issues/show', {
                            issue: issue,
                            notes: notes,
                            query: query
                        })
                    });
                } else {
                    req.flash('danger', 'Permission denied');
                    res.redirect('/stores/issues');
                };
            })
            .catch(err => {
                fn.error(err, '/stores/issues', req, res);
            });
        });
    });
    
    //download loancard
    app.get('/stores/issues/:id/loancard', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_issues', true, req, res, allowed => {
            fn.getOne(
                m.issues,
                {issue_id: req.params.id}
            )
            .then(issue => {
                if (issue._filename && issue._filename !== '') {
                    fn.downloadFile(issue._filename, res);
                } else {
                    fn.createLoanCard(
                        req.params.id
                    )
                    .then(result => {
                        fn.downloadFile(result, res);
                    })
                    .catch(err => {
                        req.flash('danger', err.message);
                        res.redirect('/stores/issues/' + req.params.id);
                    });
                }
            })
            .catch(err => {
                fn.error(err, '/stores/issues/' + req.params.id, req, res);
            });
        });
    });
};
