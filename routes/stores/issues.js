module.exports = (app, allowed, fn, isLoggedIn, m) => {
    // Index
    app.get('/stores/issues', isLoggedIn, allowed('access_issues'), (req, res) => {
        var query = {},
            where = {};
        query.ci = Number(req.query.ci) || 2;
        if (query.ci === 2) where._complete = 0;
        else if (query.ci === 3) where._complete = 1;
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
        .catch(err => fn.error(err, '/stores', req, res));
    });

    //New Logic
    app.post('/stores/issues', isLoggedIn, allowed('issues_add'), (req, res) => {
        items = []
        req.body.selected.forEach(line => {
            var arr = {};
            line.forEach(obj => {
                arr = {...arr, ...JSON.parse(obj)}
            });
            items.push(arr);
        });
        fn.createIssue(
            req.body.issue,
            items,
            req.user.user_id
        )
        .then(issue_id => {
            req.flash('success', 'Items issued, ID: ' + issue_id);
            res.redirect('/stores/users/' + req.body.issue.issued_to);
        })
        .catch(err => fn.error(err, '/stores/users/' + req.body.issue.issued_to, req, res));
    });

    //new form
    app.get('/stores/issues/new', isLoggedIn, allowed('issues_add'), (req, res) => {
        if (req.query.user) {
            fn.getOne(
                m.users,
                {user_id: req.query.user},
                {include: [m.ranks], attributes: null, nullOK: false}
            )
            .then(user => {
                if (req.query.user !== req.user.user_id) {
                    if (user.status_id === 1) res.render('stores/issues/new', {user: user}); 
                    else {
                        req.flash('danger', 'Issues can only be made to current users')
                        res.redirect('/stores/users/' + req.query.user);
                    };
                } else {
                    req.flash('info', 'You can not issue to yourself');
                    res.redirect('/stores/users/' + req.query.user);
                };
            })
            .catch(err => fn.error(err, '/stores/users', req, res));
        } else {
            req.flash('danger', 'No user specified!');
            res.redirect('/stores/users');
        };
    });

    //delete
    app.delete('/stores/issues/:id', isLoggedIn, allowed('issues_delete'), (req, res) => {
        if (req.query.user) {
            fn.delete(
                'issues',
                {issue_id: req.params.id},
                {hasLines: true}
            )
            .then(result => {
                req.flash(result.success, result.message);
                res.redirect('/stores/issues');
            })
            .catch(err => fn.error(err, '/stores/issues', req, res));
        };
    });

    //show
    app.get('/stores/issues/:id', isLoggedIn, allowed('access_issues', false), (req, res) => {
        fn.getOne(
            m.issues,
            {issue_id: req.params.id},
            {include: fn.issuesInclude(true), attributes: null, nullOK: false}
        )
        .then(issue => {
            if (req.allowed || issue.issuedTo.user_id === req.user.user_id) {
                fn.getNotes('issues', req.params.id, req)
                .then(notes => {
                    res.render('stores/issues/show', {
                        issue: issue,
                        notes: notes,
                        query: {sn: Number(req.query.sn) || 2}
                    })
                });
            } else {
                req.flash('danger', 'Permission denied');
                res.redirect('/stores/issues');
            };
        })
        .catch(err => fn.error(err, '/stores/issues', req, res));
    });
    
    //download loancard
    app.get('/stores/issues/:id/loancard', isLoggedIn, allowed('access_issues'), (req, res) => {
        fn.getOne(
            m.issues,
            {issue_id: req.params.id}
        )
        .then(issue => {
            if (issue._filename && issue._filename !== '') fn.downloadFile(issue._filename, res);
            else {
                fn.createLoanCard(req.params.id)
                .then(result => fn.downloadFile(result, res))
                .catch(err => {
                    req.flash('danger', err.message);
                    res.redirect('/stores/issues/' + req.params.id);
                });
            }
        })
        .catch(err => fn.error(err, '/stores/issues/' + req.params.id, req, res));
    });
};
