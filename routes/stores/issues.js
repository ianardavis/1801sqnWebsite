module.exports = (app, m, fn) => {
    app.get('/issues',             fn.loggedIn(), fn.permissions.get(  'access_stores', true), (req, res) => res.render('stores/issues/index'));
    app.get('/issues/:id',         fn.loggedIn(), fn.permissions.get(  'access_stores', true), (req, res) => {
        fn.get(
            'issues',
            {issue_id: req.params.id}
        )
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

    app.get('/count/issues',       fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        if (!req.allowed) req.query.user_id_issue = req.user.user_id;
        m.issues.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    function issues_allowed(allowed_stores, query, user_id) {
        return new Promise((resolve, reject) => {
            return fn.allowed(user_id, 'access_users', true)
            .then(allowed_users => {
                if (!allowed_users || !allowed_stores) {
                    if (query.user_id_issue) {
                        if (query.user_id_issue === user_id) resolve(false)
                        else reject(new Error('Permission denied'));
                    } else resolve(true);
                } else resolve(false);
            })
            .catch(err => reject(err));
        });
    };
    app.get('/get/issues',         fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        issues_allowed(req.allowed, JSON.parse(req.query.where), req.user.user_id)
        .then(add_user_id_issue => {
            // !limit !offset   -> ok       -> show all
            //  limit !offset   -> ok       -> show limit offset = 0
            // !limit  offset   -> not ok   ->            offset to 0
            //  limit  offset   -> ok       -> show limit from offset
            let _offset = (req.query.offset && !isNaN(req.query.offset)),
                _limit  = (req.query.limit  && !isNaN(req.query.limit));
            if      ( _limit && !_offset) req.query.offset = 0
            else if (!_limit && _offset)  req.query.offset = 0;
            let where      = JSON.parse(req.query.where),
                pagination = {};
            if (req.query.limit  && !isNaN(req.query.limit))  pagination.limit  = Number(req.query.limit);
            if (req.query.offset && !isNaN(req.query.offset)) pagination.offset = Number(req.query.offset);
            if (add_user_id_issue) where.user_id_issue = req.user.user_id;
            return m.issues.findAll({
                where: where,
                include: [
                    fn.inc.stores.size(),
                    fn.inc.users.user({as: 'user_issue'}),
                    fn.inc.users.user()
                ],
                ...pagination,
                ...fn.sort(req.query.sort)
            })
            .then(issues => {
                return m.issues.count({where: where})
                .then(count => {
                    res.send({success: true, result: {issues: issues, count: count, ...pagination}});
                })
                .catch(err => fn.send_error(res, err));
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/issue',          fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        fn.allowed(req.user.user_id, 'access_users', true)
        .then(allowed_users => {
            fn.get(
                'issues',
                JSON.parse(req.query.where),
                [
                    fn.inc.stores.size(),
                    fn.inc.users.user({as: 'user_issue'}),
                    fn.inc.users.user()
                ]
            )
            .then(issue => {
                if (
                    issue.user_id_issue === req.user.user_id ||
                    allowed_users       &&  req.allowed
                ) res.send({success: true, result: issue})
                else fn.send_error(res, 'Permission denied');
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/issue_loancard', fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        m.action_links.findOne({
            where: {_table: 'loancard_lines'},
            include: [{
                model: m.actions,
                where: {action: {[fn.op.or]: ['ISSUED | Added to loancard', 'Issue added to loancard']}}, //'ISSUED | Added to loancard'},
                include: [{
                    model: m.action_links,
                    as: 'links',
                    where: {
                        _table: 'issues',
                        id: JSON.parse(req.query.where).issue_id
                    }
                }]
            }],
            ...fn.sort(req.query.sort)
        })
        .then(link => {
            if (!link) fn.send_error(res, new Error('Loancard not found'))
            else {
                return fn.get(
                    'loancard_lines',
                    {loancard_line_id: link.id}
                )
                .then(line => res.send({success: true,  result: line}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });

    app.post('/users/:id/issue',   fn.loggedIn(), fn.permissions.check('issuer',        true), (req, res) => {
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
        } else fn.send_error(res, 'No lines');
        Promise.all(actions)
        .then(result => res.send({success: true, message: 'Issues created'}))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/sizes/:id/issue',   fn.loggedIn(), fn.permissions.check('issuer',        true), (req, res) => {
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
        } else fn.send_error(res, 'No lines');
        Promise.all(actions)
        .then(result => res.send({success: true, message: 'Issues created'}))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/issues',            fn.loggedIn(), fn.permissions.check('issuer',        true), (req, res) => {
        if      (!req.body.issues)                                             fn.send_error(res, 'No users or sizes entered')
        else if (!req.body.issues.users || req.body.issues.users.length === 0) fn.send_error(res, 'No users entered')
        else if (!req.body.issues.sizes || req.body.issues.sizes.length === 0) fn.send_error(res, 'No sizes entered')
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
            .catch(err => fn.send_error(res, err));
        };
    });

    app.put('/issues',             fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        if (!req.body.issues || req.body.issues.filter(e => e.status !== '').length === 0) fn.send_error(res, 'No lines submitted')
        else {
            let actions = [];
            req.body.issues.filter(e => e.status === '-2') .forEach(issue => {
                actions.push(
                    fn.issues.remove_from_loancard({
                        issue_id: issue.issue_id,
                        user_id:  req.user.user_id
                    })
                );
            });
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
                    // console.log(results);
                    res.send({success: true, message: 'Some lines failed'});
                } else res.send({success: true, message: 'Lines actioned'});
            })
            .catch(err => fn.send_error(res, err));
        };
    });
    app.put('/issues/:id/size',    fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.get(
            'issues',
            {issue_id: req.params.id},
            [m.sizes]
        )
        .then(issue => {
            fn.get(
                'sizes',
                {size_id: req.body.size_id}
            )
            .then(size => {
                if      (size.item_id !== issue.size.item_id) fn.send_error(res, new Error('New size is for a different item'))
                else if (issue.status === 1 || issue.status === 2) {
                    return fn.update(issue, {size_id: size.size_id})
                    .then(result => {
                        fn.actions.create(
                            `SIZE EDITED | From: ${fn.print_size(issue.size)} | To: ${fn.print_size(size)}`,
                            req.user.user_id,
                            [{table: 'issues', id: issue.issue_id}]
                        )
                        .then(result => res.send({success: true, message: 'Size edited'}))
                        .catch(err => {
                            console.log(err);
                            res.send({success: true, message: 'Size edited'})
                        });
                    })
                    .catch(err => fn.send_error(res, err));
                } else fn.send_error(res, new Error('Only requested and approved issues can have their size edited'));
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/issues/:id',      fn.loggedIn(), fn.permissions.check('issuer',        true), (req, res) => {
        fn.issues.cancel({
            issue_id: req.params.id,
            user_id:  req.user.user_id
        })
        .then(result => res.send({success: true, message: 'Issue cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
};