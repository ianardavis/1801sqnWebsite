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

    function get_issue(issue_id, include = []) {
        return new Promise((resolve, reject) => {
            return m.issues.findOne({
                where:      {issue_id: issue_id},
                attributes: ['issue_id', 'user_id_issue', 'size_id', '_qty', '_status'],
                include:    include
            })
            .then(issue => {
                if (!issue) reject(new Error('Issue not found'))
                else        resolve(issue);
            })
            .catch(err => reject(err));
        });
    };
    function create_action(action, user_id, options = {}) {
        return new Promise((resolve, reject) => {
            return m.actions.create({
                action:  action,
                user_id: user_id,
                ...options
            })
            .then(action => resolve(action))
            .catch(err => {
                console.log(err);
                reject(err);
            });
        });
    };

    function get_issues(lines) {
        return new Promise((resolve, reject) => {
            let actions = [];
            lines.forEach(line => {
                let include = [];
                if (line.serial_id) include.push(inc.serials({where: {serial_id: line.serial_id}, attributes: ['serial_id']}));
                if (line.stock_id)  include.push(inc.stocks( {where: {stock_id:  line.stock_id},  attributes: ['stock_id']}));
                if (line.nsn_id)    include.push(inc.nsns(   {where: {nsn_id:    line.nsn_id},    attributes: ['nsn_id']}));
                actions.push(
                    new Promise((resolve, reject) => {
                        get_issue(
                            line.issue_id,
                            [
                                inc.size({
                                    attributes: ['size_id', 'has_serials', 'has_nsns', 'issueable', 'orderable'],
                                    include:    include
                                })
                            ]
                        )
                        .then(issue => {
                            if      (!issue.size)                                               reject(new Error('Size not found'))
                            else if (issue.size.has_nsns    && !line.nsn_id)                    reject(new Error('No NSN specified'))
                            else if (issue.size.has_nsns    && issue.size.nsns.length === 0)    reject(new Error('NSN not found'))
                            else if (issue.size.has_serials && !line.serial_id)                 reject(new Error('No Serial # specified'))
                            else if (issue.size.has_serials && issue.size.serials.length === 0) reject(new Error('Serial # not found'))
                            else                                                                resolve(issue);
                        })
                        .catch(err => reject(err));
                    })
                );
            });
            return Promise.allSettled(actions)
            .then(results => {
                let issues = [];
                results.filter(e => e.status === 'fulfilled').forEach(issue => issues.push(issue.value));
                if (issues.length === 0) {
                    console.log(results);
                    reject(new Error('No valid issues'))
                } else resolve(issues);
            })
            .catch(err => reject(err));
        });
    };
    function sort_issues(issues) {
        return new Promise((resolve, reject) => {
            let users = [];
            issues.forEach(issue => {
                let index = users.findIndex(e => e.user_id_issue === issue.user_id_issue)
                if (index === -1) {
                    users.push({
                        user_id_issue: issue.user_id_issue,
                        issues:        [issue]
                    })
                } else users[index].issues.push(issue);
            });
            resolve(users);
        });
    };
    function issue_lines(lines, user_id) {
        return new Promise((resolve, reject) => {
            return fn.allowed(user_id, 'loancard_line_add')
            .then(result => {
                if (!lines || lines.length === 0) reject(new Error('No lines to issue'))
                else {
                    return get_issues(lines)
                    .then(issues => {
                        return sort_issues(issues)
                        .then(users => {
                            let actions = [];
                            users.forEach(user => {
                                actions.push(
                                    new Promise((resolve, reject) => {
                                        return fn.loancards.create({
                                            user_id_loancard: user.user_id_issue,
                                            user_id: user_id
                                        })
                                        .then(loancard => {
                                            let issue_actions = [];
                                            user.issues.forEach(issue => {
                                                issue_actions.push(issue_line(issue, user_id, loancard.loancard_id));
                                            });
                                            return Promise.all(issue_actions)
                                            .then(results => resolve(true))
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    })
                                );
                            });
                            return Promise.all(actions)
                            .then(results => resolve(true))
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    function issue_line(issue, user_id, loancard_id) {
        return new Promise((resolve, reject) => {
            let details = {
                    issue_id:    issue.issue_id,
                    size_id:     issue.size.size_id,
                    user_id:     user_id,
                    loancard_id: loancard_id
                },
                issue_action = null;
            if (issue.size.nsns.length === 1) details.nsn_id = issue.size.nsns[0].nsn_id;
            if (issue.size.has_serials) {
                details.serial_id = issue.size.serials[0].serial_id;
                issue_action = issue_line_serial(details);
            } else {
                details.stock_id = issue.size.stocks[0].stock_id;
                issue_action = issue_line_stock(details);
            };
            return issue_action
            .then(action => {
                return issue.update({status: 4})
                .then(result => {
                    return create_action('Added to loancard', user_id, action)
                    .then(action => resolve({success: true, message: 'Line added to loancard'}))
                    .catch(err =>   resolve({success: true, message: `Line added to loancard. Error creating action: ${err.message}`}));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function issue_line_serial (options) {
        //options:
        //  requires: serial_id, user_id, issue_id, user_id_issue, size_id, 
        //  optional: nsn_id
        return new Promise((resolve, reject) => {
            if (!options.serial_id) reject(new Error('No serial # specified'))
            else {
                return m.serials.findOne({
                    where:      {serial_id: options.serial_id},
                    attributes: ['serial_id', 'issue_id', 'location_id'],
                    include:    [inc.location()]
                })
                .then(serial => {
                    if      (!serial)         reject(new Error('Serial not found'))
                    else if (serial.issue_id) reject(new Error('Serial # is currently issued'))
                    else {
                        let loancard_details = {
                            size_id:     options.size_id,
                            serial_id:   serial.serial_id,
                            qty:         1,
                            user_id:     options.user_id,
                            loancard_id: options.loancard_id
                        };
                        if (options.nsn_id) loancard_details.nsn_id = options.nsn_id;
                        return issue_line_loancard(loancard_details)
                        .then(loancard_line_id => {
                            let action = {
                                    issue_id:         options.issue_id,
                                    loancard_line_id: loancard_line_id,
                                    location_id:      serial.location_id,
                                    serial_id:        serial.serial_id
                                };
                            if (options.nsn_id) action.nsn_id = options.nsn_id;
                            resolve(action);
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            };
        });
    };
    function issue_line_stock (options) {
        //options:
        //  requires: stock_id, user_id, issue_id, user_id_issue, size_id, 
        //  optional: nsn_id
        return new Promise((resolve, reject) => {
            if (!options.stock_id) reject(new Error('No stock record specified'))
            else {
                return m.stocks.findOne({
                    where:      {stock_id: options.stock_id},
                    attributes: ['stock_id', 'size_id', 'location_id', 'qty'],
                    include:    [inc.location()]
                })
                .then(stock => {
                    if      (!stock)                            reject(new Error('Stock record not found'))
                    else if (stock.size_id !== options.size_id) reject(new Error('Stock record not for this size'))
                    else {
                        let loancard_details = {
                            size_id:     options.size_id,
                            qty:         options.qty || 1,
                            user_id:     options.user_id,
                            loancard_id: options.loancard_id
                        };
                        if (options.nsn_id) loancard_details.nsn_id = options.nsn_id;
                        return issue_line_loancard(loancard_details)
                        .then(loancard_line_id => {
                            let action = {
                                    issue_id:         options.issue_id,
                                    loancard_line_id: loancard_line_id,
                                    location_id:      stock.location_id,
                                    stock_id:         stock.stock_id
                                };
                            if (options.nsn_id) action.nsn_id = options.nsn_id;
                            resolve(action);
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            };
        });
    };
    function issue_line_loancard (options = {}) {
        return new Promise((resolve, reject) => {
            return fn.loancards.lines.create(options)
            .then(loancard_line => resolve(loancard_line.line_id))
            .catch(err => reject(err));
        });
    };
};