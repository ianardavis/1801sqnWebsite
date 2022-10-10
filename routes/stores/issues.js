module.exports = (app, m, fn) => {
    const op = require('sequelize').Op;
    app.get('/issues',             fn.loggedIn(), fn.permissions.get(  'access_stores', true), (req, res) => res.render('stores/issues/index'));
    app.get('/issues/:id',         fn.loggedIn(), fn.permissions.get(  'access_stores', true), (req, res) => {
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

    app.get('/count/issues',       fn.loggedIn(), fn.permissions.check('issuer',        true), (req, res) => {
        if (!req.allowed) req.query.where.user_id_issue = req.user.user_id;
        m.issues.count({where: req.query.where})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/sum/issues',         fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
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
                        if (user_id_issue === user_id) {
                            resolve(false);

                        } else {
                            reject(new Error('Permission denied'));

                        };
                    } else {
                        resolve(true);

                    };
                } else {
                    resolve(false);

                };
            })
            .catch(err => reject(err));
        });
    };
    app.get('/get/issues',         fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        try {
            let query = req.query;
            if (!query.where) query.where = {};
            issues_allowed(req.allowed, query.where.user_id_issue, req.user.user_id)
            .then(add_user_id_issue => {
                if (!query.offset || isNaN(query.offset)) query.offset = 0;
                if (isNaN(query.limit)) delete query.limit;
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
    app.get('/get/issue',          fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
        fn.allowed(req.user.user_id, 'access_users', true)
        .then(allowed_users => {
            fn.issues.get(req.query.where)
            .then(issue => {
                if (
                    issue.user_id_issue === req.user.user_id ||
                    allowed_users       &&  req.allowed
                ) {
                    res.send({success: true, result: issue});
                } else {
                    fn.send_error(res, 'Permission denied');
                };
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/issue_loancard', fn.loggedIn(), fn.permissions.check('access_stores', true), (req, res) => {
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
            if (!link) {
                fn.send_error(res, new Error('No active links found'));
            } else {
                fn.loancards.lines.get(link.id)
                .then(line => res.send({success: true, result: line}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });

    app.post('/issues',            fn.loggedIn(), fn.permissions.check('issuer',        true), (req, res) => {
        fn.issues.create(req.body.issues, req.user.user_id, (req.allowed ? 2 : 1))
        .then(result => res.send({success: true, message: 'Issues added'}))
        .catch(err => fn.send_error(res, err));
    });

    function check_for_valid_lines_to_update(issues) {
        return new Promise((resolve, reject) => {
            if (!issues) {
                reject(new Error('No lines submitted'));
                
            } else {
                const submitted = issues.filter(e => e.status !== '').length;
                if (submitted === 0) {
                    reject(new Error('No lines submitted'));
                    
                } else {
                    resolve([issues, submitted]);
                };
            };
        });
    };
    app.put('/issues',             fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        check_for_valid_lines_to_update(req.body.lines)
        .then(([issues, submitted]) => {
            let actions = [];
            const user_id = req.user.user_id;
            
            issues.filter(e => e.status === '-1').forEach(issue => {
                actions.push(fn.issues.decline(issue.issue_id, user_id));
            });

            issues.filter(e => e.status ===  '2').forEach(issue => {
                actions.push(fn.issues.approve(issue.issue_id, user_id));
            });

            const to_order = issues.filter(e => e.status === '3');
            if (to_order.length > 0) {
                actions.push(fn.issues.order(to_order, user_id));
            };

            issues.filter(e => e.status ===  '-3' || e.status ===  '-2').forEach(issue => {
                actions.push(fn.issues.cancel(issue.issue_id, issue.status, user_id));
            });

            issues.filter(e => e.status === '0').forEach(issue => {
                actions.push(fn.issues.restore(issue.issue_id, user_id));
            });

            const to_issue = issues.filter(e => e.status === '4')
            if (to_issue.length > 0) {
                actions.push(fn.issues.issue(to_issue, user_id));
            };

            if (actions.length > 0) {
                Promise.allSettled(actions)
                .then(results => {
                    console.log(results);
                    const resolved = results.filter(e => e.status ==='fulfilled').length;
                    const message = `${resolved} of ${submitted} tasks completed`;
                    res.send({success: true, message: message})
                })
                .catch(err => fn.send_error(res, err));
            } else {
                fn.send_error(res, 'No actions to perform');
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.put('/issues/:id/qty',     fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.issues.change_qty(req.params.id, req.body.qty , req.user.user_id)
        .then(result => res.send({success: true, message: 'Quantity updated'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/issues/:id/size',    fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.issues.change_size(req.params.id, req.body.size_id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Size updated'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/issues/:id/mark',    fn.loggedIn(), fn.permissions.check('issuer'),              (req, res) => {
        fn.issues.mark_as(req.params.id, req.body.issue.status, req.user.user_id)
        .then(message => res.send({success: true, message: message}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/issues/:id',      fn.loggedIn(), fn.permissions.check('access_stores'),       (req, res) => {
        fn.issues.cancel_own(req.params.id,req.user.user_id)
        .then(result => res.send({success: true, message: 'Request cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
};