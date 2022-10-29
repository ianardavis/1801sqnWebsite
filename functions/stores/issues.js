const statuses = {0: 'cancelled', 1: 'requested', 2: 'approved', 3: 'ordered', 4: 'added to loancard', 5: 'returned'};
module.exports = function (m, fn) {
    // Common functions
    fn.issues = {};
    fn.issues.get = function (where, include = {}) {
        return new Promise((resolve, reject) => {
            let includes = [
                fn.inc.stores.size(),
                fn.inc.users.user(),
                fn.inc.users.user({as: 'user_issue'})
            ];
            if (include.loancard_lines) includes.push({
                model: m.loancard_lines,
                include: [m.loancards]
            });
            if (include.order) includes.push(m.orders);
            
            m.issues.findOne({
                where: where,
                include: includes
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
    function fulfilled(results) {
        const fulfilled = results.filter(e => e.status === 'fulfilled');
        let issues = [];
        fulfilled.forEach(issue => issues.push(issue.value));
        return issues;
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
    function check_users_and_sizes_present (issues) {
        return new Promise((resolve, reject) => {
            if (!issues) {
                reject(new Error('No users or sizes entered'));

            } else if (!issues.users || issues.users.length === 0) {
                reject(new Error('No users entered'));

            } else if (!issues.sizes || issues.sizes.length === 0) {
                reject(new Error('No sizes entered'));

            } else {
                resolve([issues.users, issues.sizes]);

            };
        });
    };
    function issue_line_to_user (user_id_issue, line, user_id, status) {
        return new Promise((resolve, reject) => {
            Promise.all([
                fn.users.get(user_id_issue),
                fn.sizes.get(line.size_id)
            ])
            .then(([user, size]) => {
                if (size.issueable) {
                    create_issue(
                        user.user_id,
                        size.size_id,
                        status,
                        line.qty,
                        user_id
                    )
                    .then(([issue_id, action]) => {
                        fn.actions.create(
                            `ISSUE | ${action}`,
                            user_id,
                            [{table: 'issues', id: issue_id}]
                        )
                        .then(action => resolve(issue_id));
                    })
                    .catch(err => reject(err));

                } else {
                    reject(new Error('Size can not be issued'));

                };
            })
            .catch(err => reject(err));
        });
    };
    function create_issue(user_id_issue, size_id, status, qty, user_id) {
        return new Promise((resolve, reject) => {
            m.issues.findOrCreate({
                where: {
                    user_id_issue: user_id_issue,
                    size_id:       size_id,
                    status:        status
                },
                defaults: {
                    user_id: user_id,
                    qty:     qty
                }
            })
            .then(([issue, created]) => {
                if (created) {
                    resolve([issue.issue_id, 'CREATED']);

                } else {
                    issue.increment('qty', {by: qty})
                    .then(result => {
                        if (result) {
                            resolve([issue.issue_id, `INCREMENTED | By ${qty}`]);

                        } else {
                            reject(new Error('Issue not incremented'));

                        };
                    })
                    .catch(err => reject(err));

                };
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.create = function (issues, user_id, status) {
        return new Promise((resolve, reject) => {
            check_users_and_sizes_present(issues)
            .then(([users, lines]) => {
                let actions = [];
                users.forEach(user => {
                    lines.forEach(line => {
                        actions.push(
                            issue_line_to_user(
                                user.user_id_issue,
                                line,
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
                    
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.cancel = function (issue_id, status, user_id) {
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
    
    function sort_issues_by_size(lines) {
        return new Promise((resolve, reject) => {
            get_line_issues_for_order(lines)
            .then(issues => {
                let sizes = [];
                issues.forEach(issue => {
                    let index = sizes.findIndex(e => e.size_id === issue.size_id);
                    if (index === -1) {
                        sizes.push({
                            size_id: issue.size_id,
                            issues: [issue],
                            qty:     issue.qty
                        });

                    } else {
                        sizes[index].issues.push(issue);
                        sizes[index].qty += Number(issue.qty);

                    };
                });
                if (sizes.length > 0) {
                    resolve(sizes);

                } else {
                    reject(new Error('No valid issues to order'));

                };
            })
            .catch(err => reject(err));
        });
    };
    function get_line_issues_for_order(lines) {
        return new Promise((resolve, reject) => {
            let actions = [];
            lines.forEach(line => {
                actions.push(
                    new Promise((resolve, reject) => {
                        fn.issues.get({issue_id: line.issue_id})
                        .then(issue => {
                            if (!issue.size) {
                                reject(new Error('Size not found'));

                            } else if (issue.status !== 2) {
                                reject(new Error('Only approved issues can be ordered'));

                            } else {
                                resolve(issue);

                            };
                        })
                        .catch(err => reject(err));
                    })
                );
            });
            Promise.allSettled(actions)
            .then(issues => resolve(fulfilled(issues)))
            .catch(err => reject(err));
        });
    };
    fn.issues.order = function (issues, user_id) {
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
                                size.issues
                            )
                            .then(order => {
                                let update_actions = [];
                                size.issues.forEach(issue => {
                                    update_actions.push(
                                        new Promise((resolve, reject) => {
                                            issue.update({
                                                status: 3,
                                                order_id: order.order_id
                                            })
                                            .then(result => {
                                                if (result) {
                                                    resolve(true);
                                                    
                                                } else {
                                                    reject(new Error('Issue not updated'));
                                                    
                                                };
                                            })
                                            .catch(err => reject(err));
                                        })
                                    );
                                });
                                Promise.allSettled(update_actions)
                                .then(results => resolve(true))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        }));
                    })
                    Promise.all(actions)
                    .then(results => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    function sort_issues_by_user(lines) {
        return new Promise((resolve, reject) => {
            let users = [];
            get_line_issues_for_issue(lines)
            .then(issues => {
                issues.forEach(([issue, line]) => {
                    let index = users.findIndex(e => e.user_id === issue.user_id_issue);
                    if (index === -1) {
                        users.push({
                            user_id: issue.user_id_issue,
                            issues:  [{issue: issue, line: line}]
                        });

                    } else {
                        users[index].issues.push({issue: issue, line: line});

                    };
                });
                if (users.length > 0) {
                    resolve(users);

                } else {
                    reject(new Error('No valid issues to add'));

                };
            })
            .catch(err => reject(err));
        });
    };
    function get_line_issues_for_issue(lines) {
        return new Promise((resolve, reject) => {
            let actions = [];
            lines.forEach(line => {
                actions.push(
                    new Promise((resolve, reject) => {
                        fn.issues.get({issue_id: line.issue_id})
                        .then(issue => {
                            if (!issue.size) {
                                reject( new Error('Size not found'));

                            } else if (issue.size.has_nsns && !line.nsn_id) {
                                reject(new Error('No NSN specified'));
                                
                            } else if (issue.size.has_serials && (!line.serials || line.serials.length === 0)) {
                                reject(new Error('No Serial #(s) specified'));

                            } else if (issue.size.has_serials && line.serials.length < issue.qty) {
                                reject(new Error('Not enough Serial #(s) specified'));

                            } else {
                                resolve([issue, line]);
                                
                            };
                        })
                        .catch(err => reject(err));
                    })
                );
            });
            Promise.all(actions)
            .then(issues => resolve(issues))
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
                            .then(([loancard_line_id, links]) => {
                                links.push({table: 'issues', id: issue.issue.issue_id});
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
                    results.filter(e => e.status === 'rejected' ).forEach(e => console.log(e));
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
    fn.issues.add_to_loancard = function (issues, user_id) {
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
                .then(size => {
                    if (size.item_id !== issue.size.item_id) {
                        reject(new Error('New size is for a different item'));

                    } else {
                        const original_size = issue.size;
                        issue.update({size_id: size.size_id})
                        .then(result => {
                            if (result) {
                                fn.actions.create(
                                    `ISSUE | UPDATED | Size changed From: ${fn.print_size(original_size)} to: ${fn.print_size(size)}`,
                                    user_id,
                                    [{table: 'issues', id: issue.issue_id}]
                                )
                                .then(result => resolve(true));

                            } else {
                                reject(new Error('Issue not updated'));

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
    fn.issues.change_qty = function (issue_id, qty, user_id) {
        return new Promise((resolve, reject) => {
            qty = Number(qty);
            if (!qty || !Number.isInteger(qty) || qty < 1) {
                reject(new Error('Invalid qty'));

            } else {
                change_check(issue_id)
                .then(issue => {
                    let original_qty = issue.qty;
                    issue.update({qty: qty})
                    .then(result => {
                        if (result) {
                            fn.actions.create(
                                `ISSUE | UPDATED | Quantity changed From: ${original_qty} to: ${qty}`,
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