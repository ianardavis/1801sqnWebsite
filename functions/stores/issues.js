const statuses = {0: 'cancelled', 1: 'requested', 2: 'approved', 3: 'ordered', 4: 'added to loancard', 5: 'returned'};
module.exports = function (m, fn) {
    fn.issues = {};
    
    fn.issues.find = function (where, include = {}) {
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
        return fn.find(m.issues, where, includes);
    };
    fn.issues.count = function (where) {return m.issues.count({where: where})};
    fn.issues.sum = function (where) {return m.issues.sum('qty', {where: where})};
    fn.issues.increment = function (issue, qty, user_id) {
        return new Promise((resolve, reject) => {
            issue.increment('qty', {by: qty})
            .then(result => {
                if (result) {
                    fn.actions.create([
                        `ISSUE | INCREMENTED | By ${qty}`,
                        user_id,
                        [{_table: 'issues', id: issue.issue_id}],
                        issue.issue_id
                    ])
                    .then(action => resolve(true));

                } else {
                    reject(new Error('Issue not incremented'));

                };
            })
            .catch(reject);
        });
    };

    fn.issues.findAll = function (allowed, query, user_id) {
        function issuerAllowed(issuer_permission, user_id_issue, user_id) {
            return new Promise(resolve => {
                if (issuer_permission) {
                    if (user_id_issue && user_id_issue !== '') {
                        resolve({where: {user_id: user_id_issue}});
    
                    } else {
                        resolve({});
    
                    };
    
                } else {
                    if (!user_id_issue || user_id_issue === user_id) {
                        resolve({where: {user_id: user_id_issue}});
    
                    } else {
                        reject(new Error('Permission denied'));
    
                    };
    
                };
            });
        };
        return new Promise((resolve, reject) => {
            if (!query.where) query.where = {};
            issuerAllowed(allowed, query.where.user_id_issue, user_id)
            .then(user_filter => {
                if (!query.offset || isNaN(query.offset)) query.offset = 0;
                if ( query.limit  && isNaN(query.limit))  delete query.limit;

                m.issues.findAndCountAll({
                    where: fn.buildQuery(query),
                    include: [
                        fn.inc.stores.size_filter(query),
                        fn.inc.users.user({as: 'user_issue', ...user_filter})
                    ],
                    ...fn.pagination(query)
                })
                .then(results => resolve(results))
                .catch(reject);
            })
            .catch(reject);
        });
    };

    function checkIssueStatus(issue_id, statuses = []) {
        return new Promise((resolve, reject) => {
            fn.issues.find({issue_id: issue_id})
            .then(issue => {
                if (statuses.includes(Number(issue.status))) {
                    resolve(issue);
                    
                } else {
                    reject(new Error('Incorrect issue status'));
                    
                };
            })
            .catch(reject);
        });
    };
    function updateIssueStatus([issue, status, user_id, action]) {
        return new Promise((resolve, reject) => {
            fn.update(issue, {status: Number(status)})
            .then(result => {
                fn.actions.create([
                    `ISSUE | ${action}`,
                    user_id,
                    [{_table: 'issues', id: issue.issue_id}]
                ])
                .then(action => resolve(true));
            })
            .catch(reject);
        });
    };

    fn.issues.markAs = function (issue_id, status, user_id) {
        function check() {
            return new Promise((resolve, reject) => {
                if (status in statuses) {
                    fn.issues.find({issue_id: issue_id})
                    .then(issue => {
                        if (Number(issue.status) === Number(status)) {
                            reject(new Error('Status has not changed'));
    
                        } else {
                            resolve([
                                issue,
                                status,
                                user_id,
                                `${statuses[status].toUpperCase()} | Set manually`
                            ]);
    
                        };
                    })
                    .catch(reject);
    
                } else {
                    reject(new Error('Invalid status'));
    
                };
            });
        };
        return new Promise((resolve, reject) => {
            check()
            .then(updateIssueStatus)
            .then(result => resolve(`Issue marked as ${statuses[status]}`))
            .catch(reject);
        });
    };

    fn.issues.update = function (lines, user_id) {
        function filterIssues([issues, submitted]) {
            return new Promise((resolve, reject) => {
                let actions = [];
                
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
                    actions.push(fn.issues.addToLoancard(to_issue, user_id));
                };

                if (actions.length > 0) {
                    resolve([actions, submitted]);

                } else {
                    reject(new Error('No actions to perform'));
    
                };
            });
        };
        return new Promise((resolve, reject) => {
            fn.checkLines(lines)
            .then(filterIssues)
            .then(fn.actionLines)
            .then(resolve)
            .catch(reject);
        });
    };

    // Specific functions
    fn.issues.create = function (issues, user_id, status) {
        function checkUsersAndSizesPresent () {
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
        function issueLineToUser(user_id_issue, line) {
            function createIssue(user_id_issue, size_id, qty) {
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
                            fn.actions.create([
                                'ISSUE | CREATED',
                                user_id,
                                [{_table: 'issues', id: issue.issue_id}]
                            ])
                            .then(result => resolve(issue.issue_id));
        
                        } else {
                            fn.issues.increment(issue, qty, user_id)
                            .then(result => resolve(issue.issue_id))
                            .catch(reject);
        
                        };
                    })
                    .catch(reject);
                });
            };
            return new Promise((resolve, reject) => {
                Promise.all([
                    fn.users.find({user_id: user_id_issue}),
                    fn.sizes.find({size_id: line.size_id})
                ])
                .then(([user, size]) => {
                    if (size.issueable) {
                        createIssue(
                            user.user_id,
                            size.size_id,
                            line.qty
                        )
                        .then(issue_id => resolve(issue_id))
                        .catch(reject);
    
                    } else {
                        reject(new Error('Size can not be issued'));
    
                    };
                })
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            checkUsersAndSizesPresent()
            .then(([users, lines]) => {
                let actions = [];
                users.forEach(user => {
                    lines.forEach(line => {
                        actions.push(
                            issueLineToUser(
                                user.user_id_issue,
                                line,
                            )
                        );
                    });
                });
                Promise.all(actions)
                .then(issue_ids => resolve(issue_ids))
                .catch(reject);
            })
            .catch(reject);
        });
    };

    // Functions whilst issue is pending
    fn.issues.decline = function (issue_id, user_id) {
        return new Promise((resolve, reject) => {
            checkIssueStatus(issue_id, [1])
            .then(issue => {
                updateIssueStatus([issue, -1, user_id, 'DECLINED'])
                .then(action => resolve(true))
                .catch(reject);
            })
            .catch(reject);
        });
    };
    fn.issues.approve = function (issue_id, user_id) {
        return new Promise((resolve, reject) => {
            checkIssueStatus(issue_id, [1])
            .then(issue => {
                updateIssueStatus([issue, 2, user_id, 'APPROVED'])
                .then(action => resolve(true))
                .catch(reject);
            })
            .catch(reject);
        });
    };
    fn.issues.cancelOwn = function (issue_id, user_id) {
        return new Promise((resolve, reject) => {
            checkIssueStatus(issue_id, [1])
            .then(issue => {
                if (issue.user_id_issue === user_id) {
                    updateIssueStatus([issue, -1, user_id, 'CANCELLED BY REQUESTER'])
                    .then(action => resolve(true))
                    .catch(reject);
                } else {
                    reject(new Error('This is not your request'));
                };
            })
            .catch(reject);
        });
    };

    // Functions whilst approved or ordered
    fn.issues.cancel = function (issue_id, status, user_id) {
        return new Promise((resolve, reject) => {
            checkIssueStatus(issue_id, [2, 3])
            .then(issue => {
                updateIssueStatus([issue, status, user_id, 'CANCELLED'])
                .then(action => resolve(true))
                .catch(reject);
            })
            .catch(reject);
        });
    };

    fn.issues.restore = function (issue_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.issues.find({issue_id: issue_id})
            .then(issue => {
                if (issue.status !== 0) {
                    reject(new Error('Issue is not cancelled/declined'));

                } else {
                    updateIssueStatus([issue, 2, user_id, 'RESTORED'])
                    .then(action => resolve(true))
                    .catch(reject);

                };
            })
            .catch(reject);
        });
    };
    
    fn.issues.order = function (issues, user_id) {
        function sortIssuesBySize() {
            function getLineIssuesForOrder() {
                function fulfilled(results) {
                    const fulfilled = results.filter(e => e.status === 'fulfilled');
                    let issues = [];
                    fulfilled.forEach(issue => issues.push(issue.value));
                    return issues;
                };
                return new Promise((resolve, reject) => {
                    let actions = [];
                    issues.forEach(issue => {
                        actions.push(
                            new Promise((resolve, reject) => {
                                fn.issues.find({issue_id: issue.issue_id})
                                .then(issue => {
                                    if (!issue.size) {
                                        reject(new Error('Size not found'));
        
                                    } else if (issue.status !== 2) {
                                        reject(new Error('Only approved issues can be ordered'));
        
                                    } else {
                                        resolve(issue);
        
                                    };
                                })
                                .catch(reject);
                            })
                        );
                    });
                    Promise.allSettled(actions)
                    .then(issues => resolve(fulfilled(issues)))
                    .catch(reject);
                });
            };
            return new Promise((resolve, reject) => {
                getLineIssuesForOrder()
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
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            fn.allowed(user_id, 'stores_stock_admin')
            .then(sortIssuesBySize)
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
                                    fn.update(
                                        issue,
                                        {
                                            status: 3,
                                            order_id: order.order_id
                                        }
                                    )
                                );
                            });
                            Promise.allSettled(update_actions)
                            .then(results => resolve(true))
                            .catch(reject);
                        })
                        .catch(reject);
                    }));
                })
                Promise.all(actions)
                .then(results => resolve(true))
                .catch(reject);
            })
            .catch(reject);
        });
    };

    fn.issues.addToLoancard = function (issues, user_id) {
        function sortIssuesByUser() {
            function getIssueForLine(line) {
                return new Promise((resolve, reject) => {
                    fn.issues.find({issue_id: line.issue_id})
                    .then(issue => {
                        if (!issue.size) {
                            reject(new Error('Size not found'));
        
                        } else if (issue.size.has_nsns && !line.nsn_id) {
                            reject(new Error('No NSN specified'));
                            
                        } else if (issue.size.has_serials && (!line.serials || line.serials.length === 0)) {
                            reject(new Error('No Serial #(s) specified'));
        
                        } else if (issue.size.has_serials && line.serials.length < issue.qty) {
                            reject(new Error('Not enough Serial #(s) specified'));
        
                        } else {
                            resolve(issue);
                            
                        };
                    })
                    .catch(reject);
                });
            };
            return new Promise((resolve, reject) => {
                let users = [];
                let actions = [];
                issues.forEach(line => {
                    actions.push(new Promise((resolve, reject) => {
                        getIssueForLine(line)
                        .then(issue => {
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
                        })
                        .catch(reject);
                    }));
                });
                Promise.all(actions)
                .then(results => {
                    if (users.length > 0) {
                        resolve(users);
    
                    } else {
                        reject(new Error('No valid issues to add'));
    
                    };
                })
                .catch(reject);
            });
        };
        function addIssuesToLoancards(user) {
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
                                .then(result => resolve(true))
                                .catch(reject);
                            })
                        );
                    });
                    Promise.allSettled(issue_actions)
                    .then(fn.logRejects)
                    .then(results => {
                        if (results.filter(e => e.status === 'fulfilled').length > 0) {
                            resolve(true);
    
                        } else {
                            reject(new Error('All lines failed'));
    
                        };
                    })
                    .catch(reject);
                })
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            if (!issues || issues.length === 0) {
                resolve(false);

            } else {
                sortIssuesByUser()
                .then(users => {
                    let actions = [];
                    users.forEach(user => actions.push(addIssuesToLoancards(user)))
                    Promise.all(actions)
                    .then(result => resolve(true))
                    .catch(reject);
                })
                .catch(reject);

            };
        });
    };

    function changeCheck(issue_id) {
        return new Promise((resolve, reject) => {
            fn.issues.find({issue_id: issue_id})
            .then(issue => {
                if (!issue.size) {
                    reject(new Error('Error getting issue size'));

                } else if (issue.status === 1 || issue.status === 2) {
                    resolve(issue);

                } else {
                    reject(new Error('Only issues with a status of requested or approved can have their quantity or size edited'));

                };
            })
            .catch(reject);
        });
    };
    fn.issues.changeSize = function (issue_id, size_id, user_id) {
        return new Promise((resolve, reject) => {
            changeCheck(issue_id)
            .then(issue => {
                fn.sizes.find({size_id: size_id})
                .then(size => {
                    if (size.item_id !== issue.size.item_id) {
                        reject(new Error('New size is for a different item'));

                    } else {
                        const original_size = fn.printSize(issue.size);
                        fn.update(
                            issue,
                            {size_id: size.size_id},
                            [
                                `ISSUE | UPDATED | Size changed From: ${original_size} to: ${fn.printSize(size)}`,
                                user_id,
                                [{_table: 'issues', id: issue.issue_id}]
                            ]
                        )
                        .then(fn.actions.create)
                        .then(result => resolve(true))
                        .catch(reject);
                    };
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };
    fn.issues.changeQty = function (issue_id, qty, user_id) {
        return new Promise((resolve, reject) => {
            qty = Number(qty);
            if (!qty || !Number.isInteger(qty) || qty < 1) {
                reject(new Error('Invalid qty'));

            } else {
                changeCheck(issue_id)
                .then(issue => {
                    const original_qty = issue.qty;
                    fn.update(
                        issue,
                        {qty: qty},
                        [
                            `ISSUE | UPDATED | Quantity changed From: ${original_qty} to: ${qty}`,
                            user_id,
                            [{_table: 'issues', id: issue.issue_id}]
                        ]
                    )
                    .then(fn.actions.create)
                    .then(result => resolve(true))
                    .catch(reject);
                })
                .catch(reject);
            };
        });
    };
};