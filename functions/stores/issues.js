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
    fn.issues.decline = function (issue_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.allowed(user_id, 'issuer')
            .then(result => {
                fn.get(
                    'issues',
                    {issue_id: issue_id}
                )
                .then(issue => {
                    if (issue.status !== 1) reject(new Error('Issue is not pending approval'))
                    else {
                        update_issue(issue, 0, user_id, 'DECLINED')
                        .then(action => resolve(true))
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.cancel  = function (issue_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.allowed(user_id, 'issuer', true)
            .then(allowed => {
                fn.get(
                    'issues',
                    {issue_id: issue_id}
                )
                .then(issue => {
                    if (!allowed && issue.user_id_issue !== user_id) reject(new Error('Permission denied'))
                    else {
                        if      (issue.status === 0) reject(new Error('Issue has already been cancelled/declined'))
                        else if (issue.status === 4) reject(new Error('Issue has already been added to a loancard'))
                        else if (issue.status === 5) reject(new Error('Issue has already been returned'))
                        else {
                            update_issue(issue, 0, user_id, 'CANCELLED')
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
    fn.issues.approve = function (issue_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.allowed(user_id, 'issuer')
            .then(result => {
                fn.get(
                    'issues',
                    {issue_id: issue_id}
                )
                .then(issue => {
                    if (issue.status !== 1) reject(new Error('Issue is not pending approval'))
                    else {
                        update_issue(issue, 2, user_id, 'APPROVED')
                        .then(action => resolve(true))
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.restore = function (issue_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.allowed(user_id, 'issuer')
            .then(result => {
                fn.get(
                    'issues',
                    {issue_id: issue_id}
                )
                .then(issue => {
                    if (issue.status !== 0) reject(new Error('Issue is not cancelled/declined'))
                    else {
                        update_issue(issue, 2, user_id, 'RESTORED')
                        .then(action => resolve(true))
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.order   = function (issues, user_id) {
        return new Promise((resolve, reject) => {
            fn.allowed(user_id, 'stores_stock_admin')
            .then(result => {
                sort_issues_by_size(issues)
                .then(sizes => {
                    let actions = [];
                    sizes.forEach(size => {
                        actions.push(new Promise((resolve, reject) => {
                            fn.orders.create(
                                size.size_id,
                                size.qty,
                                user_id,
                                size.issue_ids
                            )
                            .then(result => {
                                let issue_updates = [];
                                size.issues.forEach(e => issue_updates.push(fn.update(e, {status: 3})));
                                Promise.allSettled(issue_updates)
                                .then(result => resolve({success: true, message: 'Issue ordered'}))
                                .catch(err => {
                                    console.log(err);
                                    resolve({success: true, message: `Issue ordered. Error updating issue: ${err.message}`});
                                });
                            })
                            .catch(err => reject(err));
                        }));
                    })
                    Promise.allSettled(actions)
                    .then(results => {
                        fn.allSettledResults(results);
                        resolve(true);
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function sort_issues_by_size(lines) {
        return new Promise((resolve, reject) => {
            let actions = [], sizes = [];
            lines.forEach(line => {
                actions.push(
                    new Promise((resolve, reject) => {
                        fn.get(
                            'issues',
                            {issue_id: line.issue_id},
                            [m.sizes]
                        )
                        .then(issue => {
                            if      (!issue.size)        reject(new Error('Size not found'))
                            else if (issue.status !== 2) reject(new Error('Only approved issues can be ordered'))
                            else {
                                let index = sizes.findIndex(e => e.size_id === issue.size_id);
                                if (index === -1) {
                                    sizes.push({
                                        size_id:   issue.size_id,
                                        issue_ids: [issue.issue_id],
                                        issues:    [issue],
                                        qty:       issue.qty
                                    });
                                } else {
                                    sizes[index].issue_ids.push(issue.issue_id);
                                    sizes[index].issues.push(issue);
                                    sizes[index].qty += Number(issue.qty);
                                };
                                resolve(true);
                            };
                        })
                        .catch(err => reject(err));
                    })
                );
            });
            Promise.allSettled(actions)
            .then(results => {
                fn.allSettledResults(results);
                if (sizes.length > 0) resolve(sizes)
                else reject(new Error('No valid issues to order'));
            })
            .catch(err => reject(err));
        });
    };

    fn.issues.issue   = function (issues, user_id) {
        return new Promise((resolve, reject) => {
            if (!issues || issues.length === 0) resolve(false)
            else {
                fn.allowed(user_id, 'issuer')
                .then(result => {
                    sort_issues_by_user(issues)
                    .then(users => {
                        let actions = [];
                        users.forEach(user => actions.push(add_issues_to_loancards(user, user_id)))
                        Promise.all(actions)
                        .then(result => resolve(true))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            };
        });
    };
    function sort_issues_by_user(lines) {
        return new Promise((resolve, reject) => {
            let actions = [], users = [];
            lines.forEach(line => {
                actions.push(
                    new Promise((resolve, reject) => {
                        fn.get(
                            'issues',
                            {issue_id: line.issue_id},
                            [m.sizes]
                        )
                        .then(issue => {
                            if      (!issue.size)                                                            reject( new Error('Size not found'))
                            else if (issue.size.has_nsns    &&  !line.nsn_id)                                resolve(new Error('No NSN specified'))
                            else if (issue.size.has_serials && (!line.serials || line.serials.length === 0)) resolve(new Error('No Serial #(s) specified'))
                            else if (issue.size.has_serials &&   line.serials.length < issue.qty)            resolve(new Error('Not enough Serial #(s) specified'))
                            else {
                                let index = users.findIndex(e => e.user_id === issue.user_id_issue);
                                if (index === -1) {
                                    users.push({
                                        user_id: issue.user_id_issue,
                                        issues:  [{issue: issue, line: line}]
                                    });
                                } else users[index].issues.push({issue: issue, line: line});
                                resolve(true);
                            };
                        })
                        .catch(err => reject(err));
                    })
                );
            });
            Promise.allSettled(actions)
            .then(results => {
                fn.allSettledResults(results);
                if (users.length > 0) resolve(users)
                else reject(new Error('No valid issues to add'));
            })
            .catch(err => reject(err));
        });
    };
    function add_issues_to_loancards(user, user_id) {
        return new Promise((resolve, reject) => {
            fn.loancards.create({
                user_id_loancard: user.user_id,
                user_id: user_id
            })
            .then(loancard_id => {
                let issue_actions = [];
                user.issues.forEach(issue => {
                    issue_actions.push(
                        new Promise((resolve, reject) => {
                            fn.loancards.lines.create(loancard_id, issue.issue, user_id, issue.line)
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
        });
    };

    fn.issues.remove_from_loancard = function (issue_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.get(
                'issues',
                {issue_id: issue_id}
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
                                            user_id,
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
                where: {
                    _table: 'loancard_lines',
                    active: true
                },
                include: [{
                    model: m.actions,
                    where: {
                        action: {[fn.op.or]: [
                            {[fn.op.startsWith]: 'ISSUED | Added to loancard'},
                            {[fn.op.startsWith]: 'Issue added to loancard'}
                        ]}
                    },
                    include: [{
                        model: m.action_links,
                        as: 'links',
                        where: {
                            _table: 'issues',
                            id:     issue_id,
                            active: true
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

    fn.issues.change_size = function (issue_id, size_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.get(
                'issues',
                {issue_id: issue_id},
                [m.sizes]
            )
            .then(issue => {
                if      (![1, 2].includes(issue.status)) reject(new Error('Only requested or approved issues can have their size edited'))
                else if (!issue.size)                    reject(new Error('Error getting issue size'))
                else {
                    fn.get(
                        'sizes',
                        {size_id: size_id}
                    )
                    .then(size => {
                        if (size.item_id !== issue.size.item_id) reject(new Error('New size is for a different item'))
                        else {
                            fn.update(issue, {size_id: size.size_id})
                            .then(result => {
                                fn.actions.create(
                                    `ISSUE | UPDATED | Size changed From: ${fn.print_size(issue.size)} to: ${fn.print_size(size)}`,
                                    user_id,
                                    [{table: 'issues', id: issue.issue_id}]
                                )
                                .then(result => resolve(true))
                                .catch(err => {
                                    console.log(err);
                                    resolve(true);
                                });
                            })
                            .catch(err => reject(err));
                        }
                    })
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
};