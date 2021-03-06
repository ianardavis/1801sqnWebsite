module.exports = function (m, fn) {
    fn.issues = {};
    fn.issues.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            return fn.get(
                'users',
                {user_id: options.user_id_issue}
            )
            .then(user => {
                return fn.get(
                    'sizes',
                    {size_id: options.size_id}
                )
                .then(size => {
                    if (!size.issueable) reject(new Error('Size can not be issued'))
                    else {
                        return m.issues.findOrCreate({
                            where: {
                                user_id_issue: user.user_id,
                                size_id:       size.size_id,
                                status:        options.status
                            },
                            defaults: {
                                user_id: options.user_id,
                                qty:     options.qty
                            }
                        })
                        .then(([issue, created]) => {
                            if (created) resolve(issue.issue_id)
                            else {
                                return issue.increment('qty', {by: options.qty})
                                .then(result => {
                                    if (!result) reject(new Error('Existing issue not incremented'))
                                    else {
                                        return fn.actions.create({
                                            action:  `Issue incremented by ${options.qty}`,
                                            user_id: options.user_id,
                                            links: [{table: 'issues', id: issue.issue_id}]
                                        })
                                        .then(action => resolve(issue.issue_id))
                                        .catch(err => resolve(issue.issue_id));
                                    };
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
    function update_issue(issue, status, user_id, action) {
        return new Promise((resolve, reject) => {
            return issue.update({status: status})
            .then(result => {
                if (!result) reject(new Error('Issue not updated'))
                else {
                    return fn.actions.create({
                        action:  `Issue ${action}`,
                        user_id: user_id,
                        links: [{table: 'issues', id: issue.issue_id}]
                    })
                    .then(action => resolve(true))
                    .catch(err => reject(err));
                };
            });
        });
    };
    fn.issues.decline = function (options = {}) {
        return new Promise((resolve, reject) => {
            return fn.allowed(options.user_id, 'issue_add')
            .then(result => {
                return fn.get(
                    'issues',
                    {issue_id: options.issue_id}
                )
                .then(issue => {
                    if (issue.status !== 1) reject(new Error('Issue is not pending approval'))
                    else {
                        return update_issue(issue, 0, options.user_id, 'declined')
                        .then(action => resolve(true))
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.cancel = function (options = {}) {
        return new Promise((resolve, reject) => {
            return fn.allowed(options.user_id, 'issue_delete', true)
            .then(allowed => {
                return fn.get(
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
                            return update_issue(issue, 0, options.user_id, 'cancelled')
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
            return fn.allowed(options.user_id, 'issue_add')
            .then(result => {
                return fn.get(
                    'issues',
                    {issue_id: options.issue_id}
                )
                .then(issue => {
                    if (issue.status !== 1) reject(new Error('Issue is not pending approval'))
                    else {
                        return update_issue(issue, 2, options.user_id, 'approved')
                        .then(action => resolve(true))
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.order = function (options = {}) {
        return new Promise((resolve, reject) => {
            return fn.allowed(options.user_id, 'order_add')
            .then(result => {
                return fn.get(
                    'issues',
                    {issue_id: options.issue_id},
                    [fn.inc.stores.size()]
                )
                .then(issue => {
                    if      (issue.status !== 2)    reject(new Error('Only approved issues can be ordered'))
                    else if (!issue.size)           reject(new Error('Size not found'))
                    else if (!issue.size.orderable) reject(new Error('This size can not be ordered'))
                    else {
                        return fn.orders.create(
                            {
                                size_id: issue.size_id,
                                qty:     issue.qty
                            },
                            options.user_id,
                            issue.issue_id
                        )
                        .then(order => {
                            return update_issue(issue, 3, options.user_id, 'ordered')
                            .then(result => {
                                if (!result) reject(new Error('Issue not updated'))
                                else resolve({success: true, message: 'Issue ordered'});
                            })
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
    fn.issues.issue = function (options = {}) {
        return new Promise((resolve, reject) => {
            if (!options.issues || options.issues.length === 0) resolve(false)
            else {
                return fn.allowed(options.user_id, 'loancard_line_add')
                .then(result => {
                    return sort_issues(options.issues)
                    .then(users => {
                        return add_issues_to_loancards(users, options.user_id)
                        .then(result => resolve(true))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            };
        });
    };
    function sort_issues(issues) {
        return new Promise((resolve, reject) => {
            let actions = [], users = [];
            issues.forEach(issue => {
                actions.push(
                    new Promise((resolve, reject) => {
                        return fn.get(
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
            return Promise.allSettled(actions)
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
                        return fn.loancards.create({
                            user_id_loancard: user.user_id,
                            user_id: user_id
                        })
                        .then(loancard_id => {
                            let issue_actions = [];
                            user.issues.forEach(issue => {
                                issue_actions.push(
                                    new Promise((resolve, reject) => {
                                        return fn.loancards.lines.create({
                                            loancard_id: loancard_id,
                                            user_id:     user_id,
                                            ...issue
                                        })
                                        .then(result => resolve(result))
                                        .catch(err => reject(err));
                                    })
                                );
                            });
                            return Promise.allSettled(issue_actions)
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
            return Promise.all(actions)
            .then(results => resolve(true))
            .catch(err => reject(err));
        });
    };
};