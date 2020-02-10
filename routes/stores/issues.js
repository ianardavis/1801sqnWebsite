module.exports = (app, allowed, fn, isLoggedIn, m) => {
    // Index
    app.get('/stores/issues', isLoggedIn, allowed('access_issues'), (req, res) => {
        let where = {};
        if (Number(req.query.closed) === 2)      where._complete = 0;
        else if (Number(req.query.closed) === 3) where._complete = 1;
        fn.getAllWhere(
            m.issues, 
            where,
            {
                include: [
                    fn.users('_to'), 
                    fn.users('_by'),
                    {
                        model: m.issues_l,
                        as: 'lines'
                    }
                ],
                nullOk: false,
                attributes: null
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

    //New Logic
    app.post('/stores/issues', isLoggedIn, allowed('issues_add'), (req, res) => {
        if (req.body.selected) {
            let items = [];
            for (let [key, line] of Object.entries(req.body.selected)) {
                items.push(line);
            };
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
        } else redirect(new Error('No items selected'), req, res);
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
            {include: fn.issues_inc(true)}
        )
        .then(issue => {
            if (req.allowed || issue.issuedTo.user_id === req.user.user_id) {
                fn.getNotes('issues', req.params.id, req)
                .then(notes => {
                    res.render('stores/issues/show', {
                        issue: issue,
                        notes: notes,
                        query: {system: Number(req.query.system) || 2}
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
