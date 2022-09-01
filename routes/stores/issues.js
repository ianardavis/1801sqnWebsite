module.exports = (app, m, fn) => {
    let op = require('sequelize').Op;
    app.get('/issues',                  fn.loggedIn(), fn.permissions.get(  'access_stores', true), (req, res) => res.render('stores/issues/index'));
    app.get('/issues/:id',              fn.loggedIn(), fn.permissions.get(  'access_stores', true), (req, res) => {
        fn.issues.get(req.params.id)
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

    app.get('/count/issues',            fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        if (!req.allowed) req.query.where.user_id_issue = req.user.user_id;
        m.issues.count({where: req.query.where})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/sum/issues',              fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        m.issues.sum('qty', {where: req.query.where})
        .then(sum => res.send({success: true, result: sum}))
        .catch(err => fn.send_error(res, err));
    });
    function issues_allowed(allowed_stores, user_id_issue, user_id) {
        return new Promise((resolve, reject) => {
            fn.allowed(user_id, 'access_users', true)
            .then(allowed_users => {
                if (!allowed_users || !allowed_stores) {
                    if (user_id_issue && user_id_issue !== '') {
                        if (user_id_issue === user_id) resolve(false)
                        else reject(new Error('Permission denied'));
                    } else resolve(true);
                } else resolve(false);
            })
            .catch(err => reject(err));
        });
    };
    app.get('/get/issues',              fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        try {
            let query = req.query;
            if (!query.where) query.where = {};
            issues_allowed(req.allowed, query.where.user_id_issue, req.user.user_id)
            .then(add_user_id_issue => {
                if (!query.offset || isNaN(query.offset)) query.offset = 0;
                if (isNaN(query.limit))                   delete query.limit;
                if (add_user_id_issue) query.where.user_id_issue = req.user.user_id;
                let where   = fn.build_query(req.query),
                    include = [
                        fn.inc.stores.size_filter(req.query),
                        {
                            model:   m.users,
                            as:      'user_issue',
                            where:   (query.where.user_id_issue ? {user_id: query.where.user_id_issue} : {}),
                            include: [m.ranks]
                        }
                    ];
                m.issues.findAndCountAll({
                    where: where,
                    include: include,
                    ...fn.pagination(query)
                })
                .then(results => fn.send_res('issues', res, results, query))
                .catch(err => fn.send_error(res, err));
            })
            .catch(err => fn.send_error(res, err));
        } catch (err) {
            fn.send_error(res, err);
        };
    });
    app.get('/get/issue',               fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        fn.allowed(req.user.user_id, 'access_users', true)
        .then(allowed_users => {
            m.issues.findOne({
                where: req.query.where,
                include: [
                    fn.inc.stores.size(),
                    fn.inc.users.user({as: 'user_issue'}),
                    fn.inc.users.user()
                ]
            })
            .then(issue => {
                if (issue) {
                    if (
                        issue.user_id_issue === req.user.user_id ||
                        allowed_users       &&  req.allowed
                    ) res.send({success: true, result: issue})
                    else fn.send_error(res, 'Permission denied');
                } else res.send({success: false, message: 'Issue not found'});
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/issue_loancard',      fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        m.action_links.findOne({
            where: {
                _table: 'loancard_lines',
                active: true
            },
            include: [{
                model: m.actions,
                where: {
                    action: {[op.or]: [
                        'LOANCARD LINE | CREATED',
                        {[op.startsWith]: 'LOANCARD LINE | INCREMENTED'}
                    ]}
                },
                include: [{
                    model: m.action_links,
                    as: 'links',
                    where: {
                        _table: 'issues',
                        id: req.query.where.issue_id,
                        active: true
                    }
                }]
            }],
            ...fn.pagination(req.query)
        })
        .then(link => {
            if (!link) fn.send_error(res, new Error('No active links found'))
            else {
                fn.loancards.lines.get(link.id)
                .then(line => res.send({success: true, result: line}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });

    app.post('/issues',                 fn.loggedIn(), fn.permissions.check('issuer',        true), (req, res) => {
        if      (!req.body.issues)                                             fn.send_error(res, 'No users or sizes entered')
        else if (!req.body.issues.users || req.body.issues.users.length === 0) fn.send_error(res, 'No users entered')
        else if (!req.body.issues.sizes || req.body.issues.sizes.length === 0) fn.send_error(res, 'No sizes entered')
        else {
            let actions = [];
            req.body.issues.users.forEach(user => {
                req.body.issues.sizes.forEach(size => {
                    actions.push(
                        fn.issues.create(
                            user.user_id_issue,
                            size.size_id,
                            size.qty,
                            req.user.user_id,
                            (req.allowed ? 2 : 1)
                        )
                    );
                });
            });
            Promise.all(actions)
            .then(result => res.send({success: true, message: 'Issues added'}))
            .catch(err => fn.send_error(res, err));
        };
    });

    app.put('/issues',                  fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        if (!req.body.lines || req.body.lines.filter(e => e.status !== '').length === 0) fn.send_error(res, 'No actions')
        else {
            let actions = [];
            req.body.lines.filter(e => e.status === '-3') .forEach(issue => {
                actions.push(fn.issues.restore(issue.issue_id, req.user.user_id));
            });
            req.body.lines.filter(e => e.status === '-2') .forEach(issue => {
                actions.push(fn.issues.remove_from_loancard(issue.issue_id, req.user.user_id));
            });
            req.body.lines.filter(e => e.status === '-1').forEach(issue => {
                actions.push(fn.issues.decline(issue.issue_id, req.user.user_id));
            });
            req.body.lines.filter(e => e.status === '0') .forEach(issue => {
                actions.push(fn.issues.cancel(issue.issue_id, req.user.user_id));
            });
            req.body.lines.filter(e => e.status === '2') .forEach(issue => {
                actions.push(fn.issues.approve(issue.issue_id, req.user.user_id));
            });
            if (req.body.lines.filter(e => e.status === '3').length > 0) {
                actions.push(
                    fn.issues.order(req.body.lines.filter(e => e.status === '3'), req.user.user_id)
                );
            };
            if (req.body.lines.filter(e => e.status === '4').length > 0) {
                actions.push(
                    fn.issues.issue(req.body.lines.filter(e => e.status === '4'), req.user.user_id)
                );
            };
            if (actions.length > 0) {
                Promise.allSettled(actions)
                .then(results => res.send({success: true, message: (fn.allSettledResults(results) ? 'Lines actioned' : 'Some lines failed')}))
                .catch(err => fn.send_error(res, err));
            } else res.send({success: true, message: 'No actions to perform'});
        };
    });
    app.put('/issues/:id/qty',          fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.issues.change_qty(req.params.id, req.body.qty , req.user.user_id)
        .then(result => res.send({success: true, message: 'Quantity updated'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/issues/:id/size',         fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.issues.change_size(req.params.id, req.body.size_id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Size updated'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/issues/:id/mark/:status', fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.issues.get(req.params.id)
        .then(issue => {
            if (['0', '1', '2', '3', '4', '5'].includes(req.params.status)) {
                issue.update({status: req.params.status})
                .then(result => {
                    let status;
                    switch (req.params.status) {
                        case '0':
                            status = 'CANCELLED'
                            break;
                        case '1':
                            status = 'REQUESTED'
                            break;
                        case '2':
                            status = 'APPROVED'
                            break;
                        case '3':
                            status = 'ORDERED'
                            break;
                        case '4':
                            status = 'ISSUED'
                            break;
                        case '5':
                            status = 'RETURNED'
                            break;
                    };
                    fn.actions.create(
                        `ISSUE | ${status} | Set manually`,
                        req.user.user_id,
                        [{table: 'issues', id: issue.issue_id}]
                    )
                    .then(result => res.send({success: true, message: `Issue marked as ${status.toLowerCase()}`}));
                })
                .catch(err => {
                    console.log(err);
                    fn.send_error(res, err);
                });
            } else fn.send_error(res, new Error('Invalid status'));
        })
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/issues/:id',           fn.loggedIn(), fn.permissions.check('issuer',        true), (req, res) => {
        fn.issues.cancel(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Issue cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
};