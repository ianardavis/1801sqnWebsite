module.exports = function (m, fn) {
    fn.issues = {};
    fn.issues.get = function (issue_id, include = []) {
        return new Promise((resolve, reject) => {
            return m.issues.findOne({
                where: {issue_id: issue_id},
                include: include
            })
            .then(issue => {
                if (!issue) reject(new Error('Issue not found'))
                else resolve(issue);
            })
            .catch(err => reject(err));
        });
    };
    fn.issues.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            return m.users.findOne({where: {user_id: options.user_id_issue}})
            .then(user => {
                if (!user) reject(new Error('User not found'))
                else {
                    return m.sizes.findOne({where: {size_id: options.size_id}})
                    .then(size => {
                        if      (!size)           reject(new Error('Size not found'))
                        else if (!size.issueable) reject(new Error('Size can not be issued'))
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
                                            return m.actions.create({
                                                action: `Issue incremented by ${options.qty}`,
                                                issue_id: issue.issue_id,
                                                user_id: options.user_id
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
                };
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
                    return m.actions.create({
                        action:   `Issue ${action}`,
                        issue_id: issue.issue_id,
                        user_id:  user_id
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
                return fn.issues.get(options.issue_id)
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
                return fn.issues.get(options.issue_id)
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
                return fn.issues.get(options.issue_id)
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
                return fn.issues.get(
                    options.issue_id,
                    [
                        {model: m.sizes, as: 'size'}
                    ]
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
                        .then(result => {
                            resolve(true)///////////////////////////
                        })
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
                        fn.issues.get(
                            issue.issue_id,
                            [{model: m.sizes, as: 'size'}]
                        )
                        .then(_issue => {
                            if      (!_issue.size)                               reject(new Error('Size not found'))
                            else if (_issue.size.has_nsns    && !issue.nsn_id)   reject(new Error('No NSN specified'))
                            else if (_issue.size.has_serials && !line.serial_id) reject(new Error('No Serial # specified'))
                            else {
                                if (users.find(e => e.user_id === issue.user_id_issue)) {
                                    users.find(e => e.user_id === issue.user_id_issue).issues.push(issue);
                                } else users.push({user_id: issue.user_id_issue, issues: [issue]});
                                resolve(true);
                            };
                        })
                        .catch(err => reject(err));
                    })
                );
            });
            return Promise.allSettled(actions)
            .then(results => {
                if (results.filter(e => e.status === 'fulfilled').length > 0) resolve(true)
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
                        .then(loancard => {
                            let issue_actions = [];
                            user.issues.forEach(issue => {
                                issue_actions.push(
                                    new Promise((resolve, reject) => {
                                        return fn.loancards.lines.create({
                                            loancard_id: loancard.loancard_id,
                                            serial_id:   issue.serial_id || null,
                                            nsn_id:      issue.nsn_id    || null,
                                            size_id:     issue.size_id,
                                            user_id:     user_id,
                                            qty:         issue.qty       || null
                                        })
                                        .then(loancard_line => {
                                            return m.issues.update(
                                                {status: 4},
                                                {where: {issue_id: issue.issue_id}}
                                            )
                                            .then(result => {
                                                if (!result) reject(new Error('Issue not updated'))
                                                else {
                                                    return m.actions.create({
                                                        action: 'Issue added to loancard',
                                                        loancard_line_id: loancard_line.loancard_line_id,
                                                        issue_id: issue.issue_id,
                                                        user_id: user_id
                                                    })
                                                    .then(result => resolve(result))
                                                    .catch(err => {
                                                        console.log(err);
                                                        resolve(false);
                                                    })
                                                }
                                            })
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    })
                                );
                            });
                            return Promise.allSettled(issue_actions)
                            .then(results => {
                                if (results.filter(e => e.status === 'fulfilled').length > 0) resolve(true)
                                else reject(new Error('ALl lines failed'));
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