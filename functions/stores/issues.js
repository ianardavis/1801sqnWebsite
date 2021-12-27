module.exports = function (m, fn) {
    fn.issues = {};
    fn.issues.create  = function (user_id_issue, size_id, qty, user_id, status = 1) {
        return new Promise((resolve, reject) => {
            fn.get(
                'users',
                {user_id: user_id_issue}
            )
            .then(user => {
                fn.get(
                    'sizes',
                    {size_id: size_id}
                )
                .then(size => {
                    if (!size.issueable) reject(new Error('Size can not be issued'))
                    else {
                        m.issues.findOrCreate({
                            where: {
                                user_id_issue: user.user_id,
                                size_id:       size.size_id,
                                status:        status
                            },
                            defaults: {
                                user_id: user_id,
                                qty:     qty
                            }
                        })
                        .then(([issue, created]) => {
                            let actionArgs = [user_id, [{table: 'issues', id: issue.issue_id}]];
                            if (created) {
                                fn.actions.create(
                                    'ISSUE | CREATED',
                                    ...actionArgs
                                )
                                .then(action => resolve(issue.issue_id))
                                .catch(err => resolve(issue.issue_id));
                            } else {
                                fn.increment(issue, qty)
                                .then(result => {
                                    fn.actions.create(
                                        `ISSUE | INCREMENTED | By ${qty}`,
                                        ...actionArgs
                                    )
                                    .then(action => resolve(issue.issue_id))
                                    .catch(err => resolve(issue.issue_id));
                                })
                                .catch(err => reject(err));
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
    fn.issues.decline = function (options = {}) {
        return new Promise((resolve, reject) => {
            fn.allowed(options.user_id, 'issuer')
            .then(result => {
                fn.get(
                    'issues',
                    {issue_id: options.issue_id}
                )
                .then(issue => {
                    if (issue.status !== 1) reject(new Error('Issue is not pending approval'))
                    else {
                        update_issue(issue, 0, options.user_id, 'DECLINED')
                        .then(action => resolve(true))
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.cancel  = function (options = {}) {
        return new Promise((resolve, reject) => {
            fn.allowed(options.user_id, 'issuer', true)
            .then(allowed => {
                fn.get(
                    'issues',
                    {issue_id: options.issue_id}
                )
                .then(issue => {
                    if (!allowed && issue.user_id_issue !== options.user_id) reject(new Error('Permission denied'))
                    else {
                        if      (issue.status === 0) reject(new Error('Issue has already been cancelled/declined'))
                        else if (issue.status === 4) reject(new Error('Issue has already been added to a loancard'))
                        else if (issue.status === 5) reject(new Error('Issue has already been returned'))
                        else {
                            update_issue(issue, 0, options.user_id, 'CANCELLED')
                            .then(action => resolve(true))
                            .catch(err => reject(err));
                        };
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.approve = function (options = {}) {
        return new Promise((resolve, reject) => {
            fn.allowed(options.user_id, 'issuer')
            .then(result => {
                fn.get(
                    'issues',
                    {issue_id: options.issue_id}
                )
                .then(issue => {
                    if (issue.status !== 1) reject(new Error('Issue is not pending approval'))
                    else {
                        update_issue(issue, 2, options.user_id, 'APPROVED')
                        .then(action => resolve(true))
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.restore = function (options = {}) {
        return new Promise((resolve, reject) => {
            fn.allowed(options.user_id, 'issuer')
            .then(result => {
                fn.get(
                    'issues',
                    {issue_id: options.issue_id}
                )
                .then(issue => {
                    if (issue.status !== 0) reject(new Error('Issue is not cancelled/declined'))
                    else {
                        update_issue(issue, 2, options.user_id, 'RESTORED')
                        .then(action => resolve(true))
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.order   = function (options = {}) {
        return new Promise((resolve, reject) => {
            fn.allowed(options.user_id, 'stores_stock_admin')
            .then(result => {
                fn.get(
                    'issues',
                    {issue_id: options.issue_id},
                    [fn.inc.stores.size()]
                )
                .then(issue => {
                    if      (!issue.size)           reject(new Error('Size not found'))
                    else if ( issue.status !== 2)   reject(new Error('Only approved issues can be ordered'))
                    else if (!issue.size.orderable) reject(new Error('This size can not be ordered'))
                    else {
                        fn.orders.create(
                            issue.size_id,
                            issue.qty,
                            options.user_id,
                            issue.issue_id
                        )
                        .then(result => {
                            fn.update(issue, {status: 3})
                            .then(result => resolve({success: true, message: 'Issue ordered'}))
                            .catch(err => {
                                console.log(err);
                                resolve({success: true, message: `Issue ordered. Error updating issue: ${err.message}`});
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
    fn.issues.issue   = function (options = {}) {
        return new Promise((resolve, reject) => {
            if (!options.issues || options.issues.length === 0) resolve(false)
            else {
                fn.allowed(options.user_id, 'issuer')
                .then(result => {
                    sort_issues(options.issues)
                    .then(users => {
                        add_issues_to_loancards(users, options.user_id)
                        .then(result => resolve(true))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            };
        });
    };
    fn.issues.remove_from_loancard = function (options = {}) {
        return new Promise((resolve, reject) => {
            fn.get(
                'issues',
                {issue_id: options.issue_id}
            )
            .then(issue => {
                if (issue.status !== 4) reject(new Error('Issue has not been issued'))
                else {
                    get_loancard_line_for_issue(issue.issue_id)
                    .then(line => {
                        if ([0, 2].includes(line.status)) {
                            reject(new Error(`Loancard line has already been ${(line.status === 0 ? 'cancelled' : 'completed')}`));
                        } else if (line.status === 1) {
                            fn.decrement(line, issue.qty)
                            .then(result => {
                                fn.update(issue, {status: 2})
                                .then(result => {
                                    line.reload()
                                    .then(line => {
                                        let actions = [fn.actions.create(
                                            'ISSUE | REMOVED FROM LOANCARD',
                                            options.user_id,
                                            [
                                                {table: 'issues',         id: issue.issue_id},
                                                {table: 'loancard_lines', id: line.loancard_line_id}
                                            ]
                                        )];
                                        if (line.qty === 0) actions.push(line.update({status: 0}));
                                        Promise.allSettled(actions)
                                        .then(results => resolve(true))
                                        .catch(err => {
                                            console.log(err);
                                            resolve(false);
                                        });
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        resolve(false);
                                    });
                                })
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        } else reject(new Error('Unknown loancard line status'));
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    function get_loancard_line_for_issue(issue_id) {
        return new Promise((resolve, reject) => {
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
                            id: issue_id
                        }
                    }]
                }]
            })
            .then(link => {
                if (!link) reject(new Error('Loancard line not found'))
                else {
                    fn.get(
                        'loancard_lines',
                        {loancard_line_id: link.id},
                        [fn.inc.stores.loancard()]
                    )
                    .then(line => resolve(line))
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    function update_issue(issue, status, user_id, action) {
        return new Promise((resolve, reject) => {
            fn.update(issue, {status: status})
            .then(result => {
                fn.actions.create(
                    `ISSUE | ${action}`,
                    user_id,
                    [{table: 'issues', id: issue.issue_id}]
                )
                .then(action => resolve(true))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function sort_issues(issues) {
        return new Promise((resolve, reject) => {
            let actions = [], users = [];
            issues.forEach(issue => {
                actions.push(
                    new Promise((resolve, reject) => {
                        fn.get(
                            'issues',
                            {issue_id: issue.issue_id},
                            [fn.inc.stores.size()]
                        )
                        .then(_issue => {
                            if      (!_issue.size)                               reject(new Error('Size not found'))
                            else if (_issue.size.has_nsns    && !issue.nsn_id)   reject(new Error('No NSN specified'))
                            else if (_issue.size.has_serials && !line.serial_id) reject(new Error('No Serial # specified'))
                            else {
                                if (users.find(e => e.user_id === _issue.user_id_issue)) {
                                    users.find(e => e.user_id === _issue.user_id_issue).issues.push(issue);
                                } else users.push({user_id: _issue.user_id_issue, issues: [issue]});
                                resolve(true);
                            };
                        })
                        .catch(err => reject(err));
                    })
                );
            });
            Promise.allSettled(actions)
            .then(results => {
                if (results.filter(e => e.status === 'fulfilled').length > 0) resolve(users)
                else reject(new Error('No issues to add to loancards'));
            })
            .catch(err => reject(err));
        });
    };
    function add_issues_to_loancards(users, user_id) {
        return new Promise((resolve, reject) => {
            let actions = [];
            users.forEach(user => {
                actions.push(
                    new Promise((resolve, reject) => {
                        fn.loancards.create({
                            user_id_loancard: user.user_id,
                            user_id: user_id
                        })
                        .then(loancard_id => {
                            let issue_actions = [];
                            user.issues.forEach(issue => {
                                issue_actions.push(
                                    new Promise((resolve, reject) => {
                                        fn.loancards.lines.create({
                                            loancard_id: loancard_id,
                                            user_id:     user_id,
                                            ...issue
                                        })
                                        .then(result => resolve(result))
                                        .catch(err => reject(err));
                                    })
                                );
                            });
                            Promise.allSettled(issue_actions)
                            .then(results => {
                                if (results.filter(e => e.status === 'fulfilled').length > 0) resolve(true)
                                else reject(new Error('All lines failed'));
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    })
                );
            });
            Promise.all(actions)
            .then(results => resolve(true))
            .catch(err => reject(err));
        });
    };
};