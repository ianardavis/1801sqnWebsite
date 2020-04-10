module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //INDEX
    app.get('/stores/issues', isLoggedIn, allowed('access_issues'), (req, res) => {
        let where = {};
        if      (Number(req.query.closed) === 2) where._complete = 0;
        else if (Number(req.query.closed) === 3) where._complete = 1;
        fn.getAllWhere(
            m.issues, 
            where,
            {
                include: [
                    inc.users({as: '_to'}), 
                    inc.users({as: '_by'}),
                    inc.issue_lines()
                ]
            }
        )
        .then(issues => {
            res.render('stores/issues/index', {
                query:  {closed: Number(req.query.closed) || 2},
                issues: issues
            });
        })
        .catch(err => fn.error(err, '/stores', req, res));
    });
    //NEW
    app.get('/stores/issues/new', isLoggedIn, allowed('issue_add'), (req, res) => {
        if (req.query.user) {
            fn.getOne(
                m.users,
                {user_id: req.query.user},
                {include: [m.ranks]}
            )
            .then(user => {
                if (req.query.user !== req.user.user_id) {
                    if (user.status_id === 1 || user.status_id === 2) res.render('stores/issues/new', {user: user}); 
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
    //SHOW
    app.get('/stores/issues/:id', isLoggedIn, allowed('access_issues', {allow: true}), (req, res) => {
        fn.getOne(
            m.issues,
            {issue_id: req.params.id},
            {
                include: [
                    inc.users({as: '_to'}),
                    inc.users({as: '_by'}),
                    inc.issue_lines({include: [
                        m.nsns,
                        m.serials,
                        inc.return_lines({
                            as: 'return',
                            include: [
                                inc.stock(),
                                inc.returns()
                            ]
                        }),
                        inc.stock({include: [
                            m.locations,
                            inc.sizes({include: [
                                m.items,
                                inc.stock()
                            ]})
                        ]})
                    ]})
                ]
            }
        )
        .then(issue => {
            if (req.allowed || issue.issuedTo.user_id === req.user.user_id) {
                fn.getNotes('issues', req.params.id, req)
                .then(notes => {
                    res.render('stores/issues/show', {
                        issue: issue,
                        notes: notes,
                        query: {system: Number(req.query.system) || 2},
                        download: req.query.download || null,
                        show_tab: req.query.tab || 'details'
                    })
                });
            } else {
                req.flash('danger', 'Permission denied');
                res.redirect('/stores/issues');
            };
        })
        .catch(err => fn.error(err, '/stores/issues', req, res));
    });
    //DOWNLOAD
    app.get('/stores/issues/:id/loancard', isLoggedIn, allowed('access_issues'), (req, res) => {
        fn.getOne(
            m.issues,
            {issue_id: req.params.id}
        )
        .then(issue => {
            if (issue._filename && issue._filename !== '') {
                res.redirect('/stores/issues/' + req.params.id  + '?download=' + issue._filename);
            } else {
                fn.createLoanCard(req.params.id)
                .then(result => res.redirect('/stores/issues/' + req.params.id  + '?download=' + result))
                .catch(err => fn.error(err, '/stores/issues/' + req.params.id, req, res));
            }
        })
        .catch(err => fn.error(err, '/stores/issues/' + req.params.id, req, res));
    });

    //POST
    app.post('/stores/issues', isLoggedIn, allowed('issue_add', {send: true}), (req, res) => {
        if (req.body.selected) {
            fn.createIssue(
                req.body.issue,
                req.body.selected,
                req.user.user_id
            )
            .then(issue_id => {
                req.flash('success', 'Items issued, ID: ' + issue_id);
                res.redirect('/stores/users/' + req.body.issue.issued_to);
            })
            .catch(err => fn.error(err, '/stores/users/' + req.body.issue.issued_to, req, res));
        } else redirect(new Error('No items selected'), req, res);
    });

    //DELETE
    app.delete('/stores/issues/:id', isLoggedIn, allowed('issue_delete', {send: true}), (req, res) => {
        if (req.query.user) {
            fn.delete(
                'issues',
                {issue_id: req.params.id},
                {hasLines: true}
            )
            .then(result => res.send({result: result.success, message: result.message}))
            .catch(err => fn.send_error(err.message, res));
        };
    });
};
