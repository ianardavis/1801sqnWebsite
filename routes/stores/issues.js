module.exports = (app, m, pm, op, inc, li, send_error) => {
    let fn = {};
    require(`${process.env.FUNCS}/allowed`)(m.permissions, fn);
    require(`${process.env.FUNCS}/loancards`)(m, inc, fn);
    require(`${process.env.FUNCS}/orders`)(m, fn);
    require(`${process.env.FUNCS}/issues`)(m, fn);
    app.get('/issues',           li, pm.get('access_issues',   {allow: true}), (req, res) => res.render('stores/issues/index'));
    app.get('/issues/:id',       li, pm.get('access_issues',   {allow: true}), (req, res) => {
        fn.issues.get({issue_id: req.params.id})
        .then(issue => {
            if (
                !req.allowed &&
                req.user.user_id !== issue.user_id_issue
                ) res.redirect('/issues')
            else  res.render('stores/issues/show');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/issues');
        })
    });

    app.get('/count/issues',     li, pm.check('access_issues', {allow: true}), (req, res) => {
        if (!req.allowed) req.query.user_id_issue = req.user.user_id;
        m.issues.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/issues',       li, pm.check('access_issues', {allow: true}), (req, res) => {
        if (!req.allowed) req.query.user_id_issue = req.user.user_id;
        m.issues.findAll({
            where: req.query,
            include: [
                inc.size(),
                inc.user({as: 'user_issue'}),
                inc.user({as: 'user'})
            ]
        })
        .then(issues => res.send({success: true, result: issues}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/issue',        li, pm.check('access_issues', {allow: true}), (req, res) => {
        fn.issues.get(
            req.query,
            [
                inc.size(),
                inc.user({as: 'user_issue'}),
                inc.user()
            ]
        )
        .then(issue => {
            if (!req.allowed && issue.user_id_issue !== req.user.user_id) send_error(res, 'Permission denied')
            else res.send({success: true,  result: issue});
        })
        .catch(err => send_error(res, err));
    });

    app.post('/users/:id/issue', li, pm.check('issue_add',     {allow: true}), (req, res) => {
        let actions = [];
        if (req.body.lines) {
            req.body.lines.forEach(line => {
                actions.push(
                    create_line(
                        {
                            user_id_issue: req.params.id,
                            size_id:       Object.keys(line)[0],
                            status:        (req.allowed ? 2 : 1),
                            qty:           line.qty
                        },
                        req.user.user_id
                    )
                );
            });
        } else send_error(res, 'No lines');
        Promise.all(actions)
        .then(result => res.send({success: true, message: 'Issues created'}))
        .catch(err => send_error(res, err));
    });
    app.post('/sizes/:id/issue', li, pm.check('issue_add',     {allow: true}), (req, res) => {
        let actions = [];
        if (req.body.lines) {
            req.body.lines.forEach(line => {
                actions.push(
                    create_line(
                        {
                            user_id_issue: Object.keys(line)[0],
                            size_id:       req.params.id,
                            status:        (req.allowed ? 2 : 1),
                            qty:           line.qty
                        },
                        req.user.user_id
                    )
                );
            });
        } else send_error(res, 'No lines');
        Promise.all(actions)
        .then(result => res.send({success: true, message: 'Issues created'}))
        .catch(err => send_error(res, err));
    });
    app.post('/issues',          li, pm.check('issue_add',     {allow: true}), (req, res) => {
        if      (!req.body.issues)                                             send_error(res, 'No users or sizes entered')
        else if (!req.body.issues.users || req.body.issues.users.length === 0) send_error(res, 'No users entered')
        else if (!req.body.issues.sizes || req.body.issues.sizes.length === 0) send_error(res, 'No sizes entered')
        else {
            let actions = [];
            req.body.issues.users.forEach(user => {
                req.body.issues.sizes.forEach(size => {
                    actions.push(
                        fn.issues.create({
                            ...size,
                            ...user,
                            user_id: req.user.user_id,
                            status: (req.allowed ? 2 : 1)
                        })
                    );
                });
            });
            Promise.all(actions)
            .then(result => res.send({success: true, message: 'Issues added'}))
            .catch(err => send_error(res, err));
        };
    });

    app.put('/issues',           li, pm.check('issue_edit',    {allow: true}), (req, res) => {
        if (!req.body.issues || req.body.issues.filter(e => e.status !== '').length === 0) send_error(res, 'No lines submitted')
        else {
            let actions = [];
            req.body.issues.filter(e => e.status === '-1').forEach(issue => {
                actions.push(
                    fn.issues.decline({
                        ...issue,
                        user_id: req.user.user_id
                    })
                );
            });
            req.body.issues.filter(e => e.status === '0') .forEach(issue => {
                actions.push(
                    fn.issues.cancel({
                        ...issue,
                        user_id: req.user.user_id
                    })
                );
            });
            req.body.issues.filter(e => e.status === '2') .forEach(issue => {
                actions.push(
                    fn.issues.approve({
                        ...issue,
                        user_id: req.user.user_id
                    })
                );
            });
            req.body.issues.filter(e => e.status === '3') .forEach(issue => {
                actions.push(
                    fn.issues.order({
                        ...issue,
                        user_id: req.user.user_id
                    })
                );
            });
            actions.push(
                fn.issues.issue({
                    issues:  req.body.issues.filter(e => e.status === '4'),
                    user_id: req.user.user_id
                })
            );
            Promise.allSettled(actions)
            .then(results => {
                if (results.filter(e => e.status === 'rejected').length > 0) {
                    console.log(results);
                    res.send({success: true, message: 'Some lines failed'});
                } else res.send({success: true, message: 'Lines actioned'});
            })
            .catch(err => send_error(res, err));
        };
    });

    app.delete('/issues/:id',    li, pm.check('issue_delete',  {allow: true}), (req, res) => {
        fn.issues.cancel({
            issue_id: req.params.id,
            user_id:  req.user.user_id
        })
        .then(result => res.send({success: true, message: 'Issue cancelled'}))
        .catch(err => send_error(res, err));
    });
};