module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //INDEX
    app.get('/stores/issues', isLoggedIn, allowed('access_issues'), (req, res) => res.render('stores/issues/index'));
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
            {include: [
                inc.users({as: '_to'}),
                inc.users({as: '_by'})
        ]})
        .then(issue => {
            if (req.allowed || issue.issuedTo.user_id === req.user.user_id) {
                res.render('stores/issues/show', {
                    issue: issue,
                    notes: {table: 'issues', id: issue.issue_id},
                    download: req.query.download || null,
                    show_tab: req.query.tab || 'details'
                })
            } else {
                req.flash('danger', 'Permission denied');
                res.redirect('/');
            };
        })
        .catch(err => fn.error(err, '/', req, res));
    });
    //DOWNLOAD
    app.get('/stores/issues/:id/download', isLoggedIn, allowed('access_issues'), (req, res) => {
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
    //ASYNC GET
    app.get('/stores/getissues', isLoggedIn, allowed('access_issues', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.issues,
            req.query,
            {include: [
                inc.users({as: '_to'}), 
                inc.users({as: '_by'}),
                inc.issue_lines()
        ]})
        .then(issues => res.send({result: true, issues: issues}))
        .catch(err => fn.send_error(err.message, res));
    });
    //ASYNC GET
    app.get('/stores/getissuelinesbysize', isLoggedIn, allowed('access_issue_lines', {send: true}), (req, res) => {
        fn.getAll(
            m.issue_lines,
            [
                inc.issues(),
                inc.users(),
                inc.stock({
                    as: 'stock',
                    where: req.query,
                    required: true})
        ])
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => fn.send_error(err.message, res));
    });
    //ASYNC GET
    app.get('/stores/getissuelinesbyuser/:id', isLoggedIn, allowed('access_issue_lines', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.issue_lines,
            req.query,
            {include: [
                inc.users(),
                inc.stock({as: 'stock', size: true}),
                inc.issues({
                    where: {issued_to: req.params.id},
                    required: true
        })]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => fn.send_error(err.message, res));
    });
    app.get('/stores/getissuelines', isLoggedIn, allowed('access_issue_lines', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.issue_lines,
            req.query,
            {include: [
                m.nsns,
                m.serials,
                inc.return_lines({
                    as: 'return',
                    include: [
                        inc.stock({as: 'stock'}),
                        inc.returns()
                    ]
                }),
                inc.stock({
                    as: 'stock',
                    include: [
                        m.locations,
                        inc.sizes({
                            include: [
                                m.items,
                                inc.stock()
        ]})]})]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => fn.send_error(err.message, res));
    });

    //POST
    app.post('/stores/issues', isLoggedIn, allowed('issue_add', {send: true}), (req, res) => {
        if (req.body.selected) {
            fn.createIssue(
                req.body.user_id,
                req.user.user_id
            )
            .then(issue_id => {
                req.flash('success', 'Items issued, ID: ' + issue_id);
                res.redirect('/stores/users/' + req.body.issue.issued_to);
            })
            .catch(err => fn.error(err, '/stores/users/' + req.body.issue.issued_to, req, res));
        } else redirect(new Error('No items selected'), req, res);
    });
    app.post('/stores/issue_lines/:id', isLoggedIn, allowed('issue_line_add', {send: true}), (req, res) => {
        fn.createIssueLine(req.params.id, req.body.line)
        .then(message => res.send({result: true, message: message}))
        .catch(err => fn.send_error(err.message, res))
    });

    //DELETE
    app.delete('/stores/issues/:id', isLoggedIn, allowed('issue_delete', {send: true}), (req, res) => {
        fn.delete(
            'issue_lines',
            {issue_id: req.params.id},
            true
        )
        .then(result => {
            fn.delete(
                'issues',
                {issue_id: req.params.id}
            )
            .then(result => res.send({result: true, message: 'Issue deleted'}))
            .catch(err => fn.send_error(err.message, res));
        })
        .catch(err => fn.send_error(err.message, res));
    });
    app.delete('/stores/issue_lines/:id', isLoggedIn, allowed('issue_delete', {send: true}), (req, res) => {
        fn.delete('issue_lines', {line_id: req.params.id})
        .then(result => res.send({result: true, message: 'Line deleted'}))
        .catch(err => fn.send_error(err.message, res));
    });
};
