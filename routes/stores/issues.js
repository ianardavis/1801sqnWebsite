module.exports = (app, m, pm, op, inc, li, send_error) => {
    let loancards = {}, orders = {}, allowed = require(`../functions/allowed`);
    require('./functions/loancards')(m, inc, loancards);
    require('./functions/orders')(m, orders);
    app.get('/issues',        li, pm.get, pm.check('access_issues', {allow: true}),             (req, res) => res.render('stores/issues/index'));
    app.get('/issues/:id',    li, pm.get, pm.check('access_issues', {allow: true}),             (req, res) => {
        m.issues.findOne({
            where: {issue_id: req.params.id},
            attributes: ['issue_id', 'user_id_issue']
        })
        .then(issue => {
            if      (!issue) res.redirect('/issues')
            else if (
                !req.allowed &&
                req.user.user_id !== issue.user_id_issue
                )            res.redirect('/issues')
            else             res.render('stores/issues/show');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/issues');
        })
    });

    app.get('/count/issues',  li,         pm.check('access_issues', {allow: true, send: true}), (req, res) => {
        if (!allowed) req.query.user_id_issue = req.user.user_id;
        m.issues.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/issues',    li,         pm.check('access_issues', {allow: true, send: true}), (req, res) => {
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
    app.get('/get/issue',     li,         pm.check('access_issues', {allow: true, send: true}), (req, res) => {
        m.issues.findOne({
            where: req.query,
            include: [
                inc.size(),
                inc.user({as: 'user_issue'}),
                inc.user()
            ]
        })
        .then(issue => {
            if (!issue) send_error(res, 'Issue not found')
            else if (
                !req.allowed &&
                issue.user_id_issue !== req.user.user_id
            )           send_error(res, 'Permission denied')
            else        res.send({success: true,  result: issue});
        })
        .catch(err => send_error(res, err));
    });

    app.post('/issues',       li,         pm.check('issue_add',     {allow: true, send: true}), (req, res) => {
        if (Number(req.body.line.user_id_issue) === 1) send_error(res, 'Issues can not be made to this user')
        else {
            let _status = 1;
            if (req.allowed) _status = 2
            create_line(
                {
                    ...req.body.line,
                    ...{
                        _status: _status,
                        user_id: req.user.user_id
                    }
                },
                req.user.user_id
            )
            .then(result => res.send(result))
            .catch(err => send_error(res, err));
        };
    });

    app.put('/issues',        li,         pm.check('issue_edit',    {allow: true, send: true}), (req, res) => {
        let actions = [];
        req.body.lines.filter(e => e._status === '0').forEach(line => actions.push(decline_line(line, req.user.user_id)));
        req.body.lines.filter(e => e._status === '2').forEach(line => actions.push(approve_line(line, req.user.user_id)));
        req.body.lines.filter(e => e._status === '3').forEach(line => actions.push(order_line(  line, req.user.user_id)));
        actions.push(issue_lines(req.body.lines.filter(e => e._status === '4'), req.user.user_id));
        Promise.allSettled(actions)
        .then(results => {
            if (results.filter(e => e.status === 'rejected').length > 0) {
                console.log(results);
                res.send({success: true, message: 'Some lines failed'});
            } else res.send({success: true, message: 'Lines actioned'});
        })
        .catch(err => send_error(res, err));
    });

    app.delete('/issues/:id', li,         pm.check('issue_delete',  {allow: true, send: true}), (req, res) => {
        m.issues.findOne({
            where:      {issue_id: req.params.id},
            attributes: ['issue_id', '_status', 'user_id_issue']
        })
        .then(issue => {
            if      (!issue)                                                            send_error(res, 'Issue not found')
            else if (!req.allowed && issue.user_id_issue !== req.user.user_id)          send_error(res, 'Permission denied')
            else if (issue._status !== 1 && issue._status !== 2 && issue._status !== 3) send_error(res, 'Only requested, approved and ordered lines can be cancelled')
            else {
                return issue.update({_status: 0})
                .then(result => {
                    if (!result) send_error(res, 'Issue not cancelled')
                    else {
                        return m.actions.create({
                            issue_id: issue.issue_id,
                            _action: 'Issue cancelled',
                            user_id: req.user.user_id
                        })
                        .then(action => res.send({success: true, message: 'Issue cancelled'}))
                        .catch(err => {
                            console.log(err);
                            res.send({success: true, message: 'Line cancelled. Error creating action'});
                        });
                    };
                })
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });

    function get_user(user_id) {
        return new Promise((resolve, reject) => {
            return m.users.users.findOne(
                {where: {user_id: user_id}},
                {attributes: ['user_id', 'status_id']}
            )
            .then(user => {
                if      (!user)                                        reject(new Error('User not found'))
                else if (user.status_id !== 1 && user.status_id !== 2) reject(new Error('Only current users can be issued to'))
                else                                                   resolve(user);
            })
            .catch(err => reject(err));
        });
    };
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
    function get_size(size_id, include = []) {
        return new Promise((resolve, reject) => {
            return m.sizes.findOne({
                where:      {size_id: size_id},
                include:    include,
                attributes: ['size_id', '_orderable', '_issueable', '_nsns', '_serials']
            })
            .then(size => {
                if      (!size)            reject(new Error('Size not found'))
                else if (!size._issueable) reject(new Error('This size can not issued'))
                else                       resolve(size);
            })
            .catch(err => reject(err));

        });
    };
    function create_action(_action, user_id, options = {}) {
        return new Promise((resolve, reject) => {
            return m.actions.create({
                _action:  _action,
                user_id:  user_id,
                ...options
            })
            .then(action => resolve(action))
            .catch(err => {
                console.log(err);
                reject(err);
            });
        });
    };

    function create_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return get_user(line.user_id_issue)
            .then(user => {
                return get_size(line.size_id)
                .then(size => {
                    return m.issues.findOrCreate({
                        where: {
                            user_id_issue: user.user_id,
                            size_id:       size.size_id,
                            _status:       line._status
                        },
                        defaults: {
                            user_id: user_id,
                            _qty:    line._qty
                        }
                    })
                    .then(([issue, created]) => {
                        if (created) resolve({success: true, message: 'Issue created'})
                        else {
                            return issue.increment('_qty', {by: line._qty})
                            .then(result => {
                                return create_action(
                                    `Issue incremented by ${line._qty}`,
                                    user_id,
                                    {issue_id: issue.issue_id}
                                )
                                .then(action => resolve({success: true, message: 'Existing issue incremented'}))
                                .catch(err =>   resolve({success: true, message: `Existing issue incremented, error creating action: ${err.message}`}));
                            })
                            .catch(err => reject(err));
                        };
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function decline_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return allowed(m.permissions, user_id, 'issue_approve')
            .then(result => {
                return get_issue(line.issue_id)
                .then(issue => {
                    if (issue._status !== 1) reject(new Error('This issue is not pending approval'))
                    else {
                        return issue.update({_status: 0})
                        .then(result => {
                            if (!result) reject(new Error('Issue not updated'))
                            else {
                                return create_action(
                                    'Issue declined',
                                    user_id,
                                    {issue_id: issue.issue_id}
                                )
                                .then(action => resolve({success: true, message: 'Line declined'}))
                                .catch(err =>   resolve({success: true, message: `Line declined. Error creating action: ${err.message}`}));
                            };
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function approve_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return allowed(m.permissions, user_id, 'issue_approve')
            .then(result => {
                return get_issue(line.issue_id)
                .then(issue => {
                    if (issue._status !== 1) reject(new Error('This issue is not pending approval'))
                    else {
                        return issue.update({_status: 2})
                        .then(result => {
                            if (!result) reject(new Error('Issue not updated'))
                            else {
                                return create_action(
                                    'Issue approved',
                                    user_id,
                                    {issue_id: issue.issue_id}
                                )
                                .then(action => resolve({success: true, message: 'Line approved'}))
                                .catch(err =>   resolve({success: true, message: `Line approved. Error creating action: ${err.message}`}));
                            };
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function order_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return allowed(m.permissions, user_id, 'order_add')
            .then(result => {
                let include = [inc.sizes({attributes: ['size_id', '_orderable', '_issueable', '_nsns', '_serials']})];
                return get_issue(line.issue_id, include)
                .then(issue => {
                    if      (issue._status !== 2)    reject(new Error('Only approved orders can be ordered'))
                    else if (!issue.size)            reject(new Error('Size not found'))
                    else if (!issue.size._orderable) reject(new Error('This size can not be ordered'))
                    else {
                        return orders.create(
                            {
                                size_id: issue.size_id,
                                _qty:    issue._qty
                            },
                            user_id,
                            {
                                note: ' from issue',
                                table: {
                                    column: 'issue_id',
                                    id:     issue.issue_id
                                }
                            }
                        )
                        .then(order => {
                            return issue.update({_status: 3})
                            .then(result => {
                                if (!result) reject(new Error('Issue not updated'))
                                else {
                                    return create_action(
                                        'Issue ordered',
                                        user_id,
                                        {
                                            issue_id: issue.issue_id,
                                            order_id: order.order_id,
                                        }
                                    )
                                    .then(action => resolve({success: true, message: 'Order incremented'}))
                                    .catch(err =>   resolve({success: true, message: `Order incremented. Error creating issue action: ${err.message}`}));
                                };
                            })
                            .catch(err => {
                                console.log(err);
                                resolve({success: true, message: `Order incremented. Error updating issue: ${err.message}`});
                            });
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
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
                                inc.sizes({
                                    attributes: ['size_id', '_serials', '_nsns', '_issueable', '_orderable'],
                                    include:    include
                                })
                            ]
                        )
                        .then(issue => {
                            if      (!issue.size)                                            reject(new Error('Size not found'))
                            else if (issue.size._nsns && !line.nsn_id)                       reject(new Error('No NSN specified'))
                            else if (issue.size._nsns && issue.size.nsns.length === 0)       reject(new Error('NSN not found'))
                            else if (issue.size._serials && !line.serial_id)                 reject(new Error('No Serial # specified'))
                            else if (issue.size._serials && issue.size.serials.length === 0) reject(new Error('Serial # not found'))
                            else                                                             resolve(issue);
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
            return allowed(m.permissions, user_id, 'loancard_line_add')
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
                                        return loancards.create({
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
            if (issue.size._serials) {
                details.serial_id = issue.size.serials[0].serial_id;
                issue_action = issue_line_serial(details);
            } else {
                details.stock_id = issue.size.stocks[0].stock_id;
                issue_action = issue_line_stock(details);
            };
            return issue_action
            .then(action => {
                return issue.update({_status: 4})
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
                    include:    [inc.locations({as: 'location'})]
                })
                .then(serial => {
                    if      (!serial)         reject(new Error('Serial not found'))
                    else if (serial.issue_id) reject(new Error('Serial # is currently issued'))
                    else {
                        let loancard_details = {
                            size_id:     options.size_id,
                            serial_id:   serial.serial_id,
                            _qty:        1,
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
                    attributes: ['stock_id', 'size_id', 'location_id', '_qty'],
                    include:    [inc.locations({as: 'location'})]
                })
                .then(stock => {
                    if      (!stock)                            reject(new Error('Stock record not found'))
                    else if (stock.size_id !== options.size_id) reject(new Error('Stock record not for this size'))
                    else {
                        let loancard_details = {
                            size_id:     options.size_id,
                            _qty:        options._qty || 1,
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
            return loancards.createLine(options)
            .then(loancard_line => resolve(loancard_line.line_id))
            .catch(err => reject(err));
        });
    };
};