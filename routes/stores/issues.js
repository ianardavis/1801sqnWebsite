const   mw = {},
        fn = {};
module.exports = (app, m, allowed) => {
    require("../../db/functions")(fn, m);
    require('../../config/middleware')(mw, fn);
    // Index
    app.get('/stores/issues', mw.isLoggedIn, allowed('access_issues', true, fn.getOne, m.permissions), (req, res) => {
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
                fn.users('_for'),
                fn.users('_by'),
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

    //New Logic
    app.post('/stores/issues', mw.isLoggedIn, allowed('issues_add', true, fn.getOne, m.permissions), (req, res) => {
        fn.createIssue(
            req.body.issue,
            req.body.selected,
            req.user.user_id
        )
        .then(issue_id => {
            req.flash('success', 'Items issued');
            res.redirect('/stores/users/' + req.body.issue.issued_to);
        })
        .catch(err => {
            fn.error(err, '/stores/users/' + req.body.issue.issued_to, req, res);
        });
    });

    //new form
    app.get('/stores/issues/new', mw.isLoggedIn, allowed('issues_add', true, fn.getOne, m.permissions), (req, res) => {
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

    //delete
    app.delete('/stores/issues/:id', mw.isLoggedIn, allowed('issues_delete', true, fn.getOne, m.permissions), (req, res) => {
        if (req.query.user) {
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
        };
    });

    //show
    app.get('/stores/issues/:id', mw.isLoggedIn, allowed('access_issues', false, fn.getOne, m.permissions), (req, res) => {
        var query = {};
        query.sn = Number(req.query.sn) || 2
        fn.getOne(
            m.issues,
            {issue_id: req.params.id},
            fn.issuesInclude(true)
        )
        .then(issue => {
            if (req.allowed || issue.issuedTo.user_id === req.user.user_id) {
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
    
    //download loancard
    app.get('/stores/issues/:id/loancard', mw.isLoggedIn, allowed('access_issues', true, fn.getOne, m.permissions), (req, res) => {
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
};
