module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //INDEX
    app.get('/stores/issues', isLoggedIn, allowed('access_issues'), (req, res) => res.render('stores/issues/index'));
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
    //SHOW LINE
    app.get('/stores/issue_lines/:id', isLoggedIn, allowed('access_issues', {allow: true}), (req, res) => {
        fn.getOne(
            m.issue_lines,
            {line_id: req.params.id},
        )
        .then(line => res.redirect('/stores/issues/' + line.issue_id))
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
    
    //PUT
    app.put('/stores/issues/:id', isLoggedIn, allowed('issue_edit', {send: true}), (req, res) => {
        if (req.body.issue) {
            fn.getOne(
                m.issues,
                {issue_id: req.params.id},
                {include: [inc.issue_lines()], attributes: ['issue_id']}
            )
            .then(issue => {
                if (issue.lines.length > 0) {
                    fn.update(
                        m.issues,
                        req.body.issue,
                        {issue_id: issue.issue_id}
                    )
                    .then(result => res.send({result: true, message: 'Issue updated'}))
                    .catch(err => fn.send_error(err.message, res));
                } else fn.send_error('An issue must have at least 1 line to be completed', res);
            })
            .catch(err => fn.send_error(err.message, res));
        } else fn.send_error('No issue details', res);
    });

    //POST
    app.post('/stores/issues', isLoggedIn, allowed('issue_add', {send: true}), (req, res) => {
        fn.createIssue({
            issued_to: req.body.issued_to,
            user_id:   req.user.user_id,
            _date_due: fn.addYears(7)
        })
        .then(issue_id => {
            let message = 'Issue raised: ';
            if (!result.created) message = 'There is already an issue open for this user: ';
            res.send({result: true, message: message + issue_id})
        })
        .catch(err => fn.send_error(err.message, res));
    });
    app.post('/stores/issue_lines/:id', isLoggedIn, allowed('issue_line_add', {send: true}), (req, res) => {
        req.body.line.user_id = req.user.user_id;
        req.body.line.issue_id = req.params.id;
        fn.createIssueLine(req.body.line)
        .then(line_id => res.send({result: true, message: 'Line added: ' + line_id}))
        .catch(err => fn.send_error(err.message, res))
    });

    //DELETE
    app.delete('/stores/issues/:id', isLoggedIn, allowed('issue_delete', {send: true}), (req, res) => {
        fn.getOne(
            m.issues,
            {issue_id: req.params.id},
            {include: [inc.issue_lines()]}
        )
        .then(issue => {
            if (issue._complete || issue._closed) fn.send_error('Completed/closed issues can not be deleted');
            else {
                if (issue.lines.filter(e => e.return_line_id).length === 0) {
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
                } else fn.send_error('Returned issue lines can not be deleted');
            };
        })
        .catch(err => fn.send_error(err.message, res));
    });
    app.delete('/stores/issue_lines/:id', isLoggedIn, allowed('issue_line_delete', {send: true}), (req, res) => {
        fn.getOne(
            m.issue_lines,
            {line_id: req.params.id}
        )
        .then(line => {
            if (line.return_line_id) fn.send_error('Returned issue lines can not be deleted')
            else {
                fn.delete('issue_lines', {line_id: req.params.id})
                .then(result => res.send({result: true, message: 'Line deleted'}))
                .catch(err => fn.send_error(err.message, res));
            };
        })
        .catch(err => fn.send_error(err.message, res));
    });
};