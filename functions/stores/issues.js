const statuses = {0: 'cancelled', 1: 'requested', 2: 'approved', 3: 'ordered', 4: 'issued', 5: 'returned'};
module.exports = function (m, fn) {
    // Common functions
    fn.issues = {};
    fn.issues.get = function (where) {
        return new Promise((resolve, reject) => {
            m.issues.findOne({
                where: where,
                include: [
                    fn.inc.stores.size(),
                    fn.inc.users.user(),
                    fn.inc.users.user({as: 'user_issue'})
                ]
            })
            .then(issue => {
                if (issue) {
                    resolve(issue);
                } else {
                    reject(new Error('Issue not found'));
                };
            })
            .catch(err => reject(err));
        });
    };

    function update_issue_status(issue, status, user_id, action, links = []) {
        return new Promise((resolve, reject) => {
            issue.update({status: status})
            .then(result => {
                if (result) {
                    fn.actions.create(
                        `ISSUE | ${action}`,
                        user_id,
                        [{table: 'issues', id: issue.issue_id}].concat(links)
                    )
                    .then(action => resolve(true));
                } else {
                    reject(new Error('Issue status not updated'));
                };
            })
            .catch(err => reject(err));
        });
    };

    function mark_check(issue_id, status) {
        return new Promise((resolve, reject) => {
            if (status in statuses) {
                fn.issues.get({issue_id: issue_id})
                .then(issue => {
                    if (issue.status === Number(status)) {
                        reject(new Error('Status has not changed'));
                    } else {
                        resolve(issue);
                    };
                })
                .catch(err => reject(err));
            } else {
                reject(new Error('Invalid status'));
            };
        });
    };
    fn.issues.mark_as = function (issue_id, status, user_id) {
        return new Promise((resolve, reject) => {
            mark_check(issue_id, status)
            .then(issue => {
                const status_text = statuses[status];
                update_issue_status(
                    issue,
                    Number(status),
                    user_id,
                    `${status_text.toUpperCase()} | Set manually`
                )
                .then(result => resolve(`Issue marked as ${status_text}`))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    // Specific functions
    function check_users_and_sizes_present (issue) {
        return new Promise((resolve, reject) => {
            if (!issue) {
                reject(new Error('No users or sizes entered'));
            } else if (!issue.users || issue.users.length === 0) {
                reject(new Error('No users entered'));
            } else if (!issue.sizes || issue.sizes.length === 0) {
                reject(new Error('No sizes entered'));
            } else {
                resolve(true);
            };
        });
    };
    function create_issue (user_id_issue, size_id, qty, user_id, status) {
        return new Promise((resolve, reject) => {
            Promise.all([
                fn.users.get(user_id_issue),
                fn.sizes.get(size_id)
            ])
            .then(([user, size]) => {
                if (size.issueable) {
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
                        if (created) {
                            fn.actions.create(
                                'ISSUE | CREATED',
                                user_id,
                                [{table: 'issues', id: issue.issue_id}]
                            )
                            .then(action => resolve(issue.issue_id));
                        } else {
                            issue.increment('qty', {by: qty})
                            .then(result => {
                                if (result) {
                                    fn.actions.create(
                                        `ISSUE | INCREMENTED | By ${qty}`,
                                        user_id,
                                        [{table: 'issues', id: issue.issue_id}]
                                    )
                                    .then(action => resolve(issue.issue_id));
                                } else {
                                    reject(new Error('Issue not incremented'));
                                };
                            })
                            .catch(err => reject(err));
                        };
                    })
                    .catch(err => reject(err));
                } else {
                    reject(new Error('Size can not be issued'));
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.create = function (issue, user_id, status) {
        return new Promise((resolve, reject) => {
            check_users_and_sizes_present(issue)
            .then(result => {
                let actions = [];
                issue.users.forEach(user => {
                    issue.sizes.forEach(size => {
                        actions.push(
                            create_issue(
                                user.user_id_issue,
                                size.size_id,
                                size.qty,
                                user_id,
                                status
                            )
                        );
                    });
                });
                Promise.all(actions)
                .then(issue_ids => resolve(issue_ids))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    // Functions whilst issue is pending
    function check_issue_is_pending_approval(issue_id) {
        return new Promise((resolve, reject) => {
            fn.issues.get({issue_id: issue_id})
            .then(issue => {
                if (issue.status !== 1) {
                    reject(new Error('Issue is not pending approval'));
                } else {
                    resolve(issue);
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.decline = function (issue_id, user_id) {
        return new Promise((resolve, reject) => {
            check_issue_is_pending_approval(issue_id)
            .then(issue => {
                update_issue_status(issue, -1, user_id, 'DECLINED')
                .then(action => resolve(true))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.approve = function (issue_id, user_id) {
        return new Promise((resolve, reject) => {
            check_issue_is_pending_approval(issue_id)
            .then(issue => {
                update_issue_status(issue, 2, user_id, 'APPROVED')
                .then(action => resolve(true))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.cancel_own = function (issue_id, user_id) {
        return new Promise((resolve, reject) => {
            check_issue_is_pending_approval(issue_id)
            .then(issue => {
                if (issue.user_id_issue === user_id) {
                    update_issue_status(issue, -1, user_id, 'CANCELLED BY REQUESTER')
                    .then(action => resolve(true))
                    .catch(err => reject(err));
                } else {
                    reject('This is not your request');
                };
            })
            .catch(err => reject(err));
        });
    };

    // Functions whilst approved or ordered
    function check_issue_is_approved_or_ordered(issue_id) {
        return new Promise((resolve, reject) => {
            fn.issues.get({issue_id: issue_id})
            .then(issue => {
                if (issue.status === 2 || issue.status === 3) {
                    resolve(issue);
                } else {
                    reject(new Error('Issue does not have a status of approved or ordered'));
                }
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.cancel  = function (issue_id, status, user_id) {
        return new Promise((resolve, reject) => {
            check_issue_is_approved_or_ordered(issue_id)
            .then(issue => {
                update_issue_status(issue, status, user_id, 'CANCELLED')
                .then(action => resolve(true))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.issues.restore = function (issue_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.issues.get({issue_id: issue_id})
            .then(issue => {
                if (issue.status !== 0) {
                    reject(new Error('Issue is not cancelled/declined'));
                } else {
                    update_issue_status(issue, 2, user_id, 'RESTORED')
                    .then(action => resolve(true))
                    .catch(err => reject(err));
                };
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
                                size.issues.forEach(e => issue_updates.push(e.update({status: 3})));
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
                        fn.issues.get({issue_id: line.issue_id})
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
                            .then(links => {
                                update_issue_status(
                                    issue.issue,
                                    4,
                                    user_id,
                                    `ADDED TO LOANCARD`,
                                    links
                                )
                                .then(result => resolve(result))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                    );
                });
                Promise.allSettled(issue_actions)
                .then(results => {
                    if (results.filter(e => e.status === 'rejected' ).length > 0) console.log(results);
                    if (results.filter(e => e.status === 'fulfilled').length > 0) {
                        resolve(true);

                    } else {
                        reject(new Error('All lines failed'));

                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function sort_issues_by_user(lines) {
        return new Promise((resolve, reject) => {
            let actions = [], users = [];
            lines.forEach(line => {
                actions.push(
                    new Promise((resolve, reject) => {
                        fn.issues.get({issue_id: line.issue_id})
                        .then(issue => {
                            if (!issue.size) {
                                reject( new Error('Size not found'));

                            } else if (issue.size.has_nsns && !line.nsn_id) {
                                resolve(new Error('No NSN specified'));
                                
                            } else if (issue.size.has_serials && (!line.serials || line.serials.length === 0)) {
                                resolve(new Error('No Serial #(s) specified'));

                            } else if (issue.size.has_serials && line.serials.length < issue.qty) {
                                resolve(new Error('Not enough Serial #(s) specified'));

                            } else {
                                let index = users.findIndex(e => e.user_id === issue.user_id_issue);
                                if (index === -1) {
                                    users.push({
                                        user_id: issue.user_id_issue,
                                        issues:  [{issue: issue, line: line}]
                                    });

                                } else {
                                    users[index].issues.push({issue: issue, line: line});

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
                if (users.length > 0) {
                    resolve(users);

                } else {
                    reject(new Error('No valid issues to add'));

                };
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.issue   = function (issues, user_id) {
        return new Promise((resolve, reject) => {
            if (!issues || issues.length === 0) {
                resolve(false);

            } else {
                sort_issues_by_user(issues)
                .then(users => {
                    let actions = [];
                    users.forEach(user => actions.push(add_issues_to_loancards(user, user_id)))
                    Promise.all(actions)
                    .then(result => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));

            };
        });
    };

    fn.issues.remove_from_loancard = function (issue_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.issues.get({issue_id: issue_id})
            .then(issue => {
                if (issue.status !== 4) reject(new Error('Issue has not been issued'))
                else {
                    get_loancard_line_for_issue(issue.issue_id)
                    .then(line => {
                        if ([0, 2].includes(line.status)) {
                            reject(new Error(`Loancard line has already been ${(line.status === 0 ? 'cancelled' : 'completed')}`));
                        } else if (line.status === 1) {
                            line.decrement('qty', {by: issue.qty})
                            .then(result => {
                                issue.update({status: 2})
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
                            'LOANCARD LINE | CREATED',
                            {[fn.op.startsWith]: 'LOANCARD LINE | INCREMENTED'}
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
                    fn.loancards.lines.get(link.id)
                    .then(line => resolve(line))
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };

    function change_check(issue_id) {
        return new Promise((resolve, reject) => {
            fn.issues.get({issue_id: issue_id})
            .then(issue => {
                if (!issue.size) {
                    reject(new Error('Error getting issue size'));
                } else if (issue.status === 1 || issue.status === 2) {
                    resolve(issue);
                } else {
                    reject(new Error('Only issues with a status of requested or approved can have their quantity or size edited'));
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.change_size = function (issue_id, size_id, user_id) {
        return new Promise((resolve, reject) => {
            change_check(issue_id)
            .then(issue => {
                fn.sizes.get(size_id)
                .then(new_size => {
                    if (new_size.item_id !== issue.size.item_id) {
                        reject(new Error('New size is for a different item'));
                    } else {
                        const start_size = issue.size;
                        issue.update({size_id: new_size.size_id})
                        .then(result => {
                            if (result) {
                                fn.actions.create(
                                    `ISSUE | UPDATED | Size changed From: ${fn.print_size(start_size)} to: ${fn.print_size(new_size)}`,
                                    user_id,
                                    [{table: 'issues', id: issue.issue_id}]
                                )
                                .then(result => resolve(true));
                            } else {
                                reject(new Error('Issue not updated'));
                            };
                        })
                        .catch(err => reject(err));
                    }
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.change_qty = function (issue_id, qty, user_id) {
        return new Promise((resolve, reject) => {
            qty = Number(qty);
            if (!qty || !Number.isInteger(qty) || qty < 1) {
                reject(new Error('Invalid qty'));
            } else {
                change_check(issue_id)
                .then(issue => {
                    let start_qty = issue.qty;
                    issue.update({qty: qty})
                    .then(result => {
                        if (result) {
                            fn.actions.create(
                                `ISSUE | UPDATED | Quantity changed From: ${start_qty} to: ${qty}`,
                                user_id,
                                [{table: 'issues', id: issue.issue_id}]
                            )
                            .then(result => resolve(true));
                        } else {
                            reject(new Error('Issue not updated'));
                        };
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            };
        });
    };
};