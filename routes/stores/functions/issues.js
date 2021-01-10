module.exports = function (m, issues) {
    let loancards = {};
    require('./loancards')(m, loancards);
    function checkNSN() {
        return new Promise((resolve, reject) => {
            m.stores.nsns.findOne({
                where: {nsn_id: line.nsn_id},
                attributes: ['nsn_id']
            })
            .then(nsn => {
                if (!nsn) reject(new Error('NSN not found'))
                else      resolve(nsn);
            })
            .catch(err => reject(error));
        })
    };
    issues.create = function (line = {}) {
        return new Promise((resolve, reject) => {
            return m.users.users.findOne(
                {where: {user_id: line.user_id_issue}},
                {attributes: ['user_id']}
            )
            .then(user => {
                if (!user) resolve({success: false, message: 'User not found'})
                else {
                    return m.stores.sizes.findOne({
                        where: {size_id: line.size_id},
                        attributes: ['size_id', '_issueable', '_serials']
                    })
                    .then(size => {
                        if      (!size)            resolve({success: false, message: 'Size not found'})
                        else if (!size._issueable) resolve({success: false, message: 'This size can not issued'})
                        else {
                            return m.stores.issues.findOrCreate({
                                where: {
                                    user_id_issue: user.user_id,
                                    size_id:       size.size_id,
                                    _status:       line._status
                                },
                                defaults: {
                                    user_id: line.user_id,
                                    _qty:    line.line._qty
                                }
                            })
                            .then(([issue, created]) => {
                                if (created) resolve({success: true, message: 'Issue created'})
                                else {
                                    return issue.increment('_qty', {by: line._qty})
                                    .then(result => {
                                        return m.stores.issue_actions.create({
                                            issue_id: issue.issue_id,
                                            _action:  `Incremented by ${line._qty}`,
                                            user_id:  line.user_id
                                        })
                                        .then(action => resolve({success: true, message: 'Issue incremented'}))
                                        .catch(err => {
                                            console.log(error);
                                            resolve({success: true, message: `Issue incremented, error creating action: ${error.message}`})
                                        });
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
    issues.update = function (line = {}) {
        return new Promise((resolve, reject) => {
            return m.stores.issues.findOne({
                where:      {issue_id: line.issue_id},
                attributes: ['issue_id', 'user_id_issue', 'size_id', '_qty', '_status']
            })
            .then(issue => {
                if (!issue) resolve({success: false, message: 'Issue not found'})
                else {
                    let permission = null;
                    if        (line._status === 2) {
                        if (issue._status !== 1) resolve({success: false, message: 'Issue is not awaiting approval'})
                        else permission = {_permission: 'issue_edit'};
                    } else if (line._status === 3) {
                        if (issue._status !== 2) resolve({success: false, message: 'Issue is not approved'})
                        else permission = {_permission: 'order_add'};
                    } else if (line._status === 4) {
                        if (issue._status !== 2 && issue._status !== 3) resolve({success: false, message: 'Issue is not approved or ordered'})
                        else permission = {_permission: 'loancard_add'};
                    } else if (line._status === 5) {
                        if (issue._status !== 4) resolve({success: false, message: 'Line not issued'})
                        else permission = {_permission: 'issue_edit'};
                    };
                    if (!permission) resolve({success: false, message: 'Invalid status'})
                    else {
                        return m.stores.permissions.findOne({
                            where: {
                                user_id: line.user_id,
                                ...permission
                            }
                        })
                        .then(permission => {
                            if (!permission) resolve({success: false, message: 'Permission denied'})
                            else {
                                return m.stores.sizes.findOne({
                                    where:      {size_id: issue.size_id},
                                    attributes: ['size_id', '_issueable', '_orderable']
                                })
                                .then(size => {
                                    let actions = [];
                                    if        (line.nsn_id) {
                                        actions.push(
                                            new Promise((resolve, reject) => {
                                                m.stores.nsns.findOne({
                                                    where: {nsn_id: line.nsn_id},
                                                    attributes: ['nsn_id']
                                                })
                                                .then(nsn => {
                                                    if (!nsn) reject(new Error('NSN not found'))
                                                    else      resolve(true);
                                                })
                                                .catch(err => reject(error));
                                            })
                                        );
                                    };
                                    if        (line.serial_id) {
                                        actions.push(new Promise((resolve, reject) => {
                                            m.stores.serials.findOne({
                                                where: {serial_id: line.serial_id},
                                                attributes: ['serial_id']
                                            })
                                            .then(serial => {
                                                if (!serial) reject(new Error('Serial # not found'))
                                                else {
                                                    line.serial = serial;
                                                    resolve(true);
                                                };
                                            })
                                            .catch(err => reject(error));
                                        }));
                                    } else if (line._serial) {
                                        actions.push(new Promise((resolve, reject) => {
                                            m.stores.serials.findOne({
                                                where: {
                                                    size_id: size.size_id,
                                                    _serial: line._serial
                                                },
                                                attributes: ['serial_id']
                                            })
                                            .then(serial => {
                                                if (!serial) reject(new Error('Serial # not found'))
                                                else {
                                                    line.serial    = serial;
                                                    line.serial_id = serial.serial_id
                                                    resolve(true);
                                                };
                                            })
                                            .catch(err => reject(err));
                                        }));
                                    };
                                    if        (line.stock_id) {
                                        actions.push(new Promise((resolve, reject) => {
                                            m.stores.stocks.findOne({
                                                where: {stock_id: line.stock_id},
                                                attributes: ['stock_id']
                                            })
                                            .then(stock => {
                                                if (!stock) reject(new Error('Stock location not found'))
                                                else {
                                                    line.stock = stock;
                                                    resolve(true);
                                                };
                                            })
                                            .catch(err => reject(err));
                                        }));
                                    } else if (line._location) {
                                        actions.push(new Promise((resolve, reject) => {
                                            m.stores.locations.findOrCreate({
                                                where: {_location: line._location}
                                            })
                                            .then(([location, created]) => {
                                                m.stores.stocks.findOrCreate({
                                                    where: {
                                                        size_id: size.size_id,
                                                        location_id: location.location_id
                                                    },
                                                    defaults: {
                                                        _qty: 0
                                                    }
                                                })
                                                .then(([stock, created]) => {
                                                    line.stock = stock;
                                                    line.stock_id = stock.stock_id;
                                                    resolve(true);
                                                })
                                                .catch(err => reject(err));
                                            })
                                            .catch(err => reject(err));
                                        }));
                                    };
                                    Promise.all(actions)
                                    .then(results => {
                                        if        (line._status === 2) {
                                            return issue.update({_status: 2})
                                            .then(result => {
                                                m.stores.issue_actions.create({
                                                    issue_id: issue.issue_id,
                                                    _action: 'Approved',
                                                    user_id: line.user_id
                                                })
                                                .then(action => resolve({success: true, message: 'Line approved'}))
                                                .catch(err =>   resolve({success: true, message: `Line approved. Error creating action: ${err.message}`}));
                                            })
                                            .catch(err => reject(err));
                                        } else if (line._status === 3) {
                                            return m.stores.orders.findOrCreate({
                                                where: {
                                                    size_id: issue.size_id,
                                                    _status: 1
                                                },
                                                defaults: {
                                                    _qty: issue._qty,
                                                    user_id: line.user_id
                                                }
                                            })
                                            .then(([order, created]) => {
                                                if (created) {
                                                    return issue.update({_status: 3})
                                                    .then(result => {
                                                        return m.stores.order_actions.create({
                                                            order_id: order.order_id,
                                                            _action: 'Created from issue',
                                                            issue_id: issue.issue_id,
                                                            user_id: line.user_id
                                                        })
                                                        .then(action => {
                                                            return m.stores.issue_actions.create({
                                                                issue_id: issue.issue_id,
                                                                _action: 'Ordered',
                                                                order_id: order.order_id,
                                                                user_id: line.user_id
                                                            })
                                                            .then(action => resolve({success: true, message: 'Order created'}))
                                                            .catch(err => resolve({success: true, message: `Order created. Error creating issue action: ${err.message}`}));
                                                        })
                                                        .catch(err => resolve({success: true, message: `Order created. Error creating order action: ${err.message}`}));
                                                    })
                                                    .catch(err => resolve({success: true, message: `Order created. Error updating issue: ${err.message}`}));
                                                } else {
                                                    order.increment('_qty', {by: issue._qty})
                                                    .then(result => {
                                                        return issue.update({_status: 3})
                                                        .then(result => {
                                                            return m.stores.order_actions.create({
                                                                order_id: order.order_id,
                                                                _action: 'Created from issue',
                                                                issue_id: issue.issue_id,
                                                                user_id: line.user_id
                                                            })
                                                            .then(action => {
                                                                return m.stores.issue_actions.create({
                                                                    issue_id: issue.issue_id,
                                                                    _action: 'Ordered',
                                                                    order_id: order.order_id,
                                                                    user_id: line.user_id
                                                                })
                                                                .then(action => resolve({success: true, message: 'Order incremented'}))
                                                                .catch(err => resolve({success: true, message: `Order incremented. Error creating issue action: ${err.message}`}));
                                                            })
                                                            .catch(err => resolve({success: true, message: `Order incremented. Error creating order action: ${err.message}`}));
                                                        })
                                                        .catch(err => resolve({success: true, message: `Order incremented. Error updating issue: ${err.message}`}));
                                                    })
                                                    .catch(err => reject(err));
                                                };
                                                
                                            })
                                            .catch(err => reject(err));
                                        } else if (line._status === 4) {
                                            if      (!size._issueable)                  resolve({success: false, message: 'This size can not issued'})
                                            else if (size._nsns     && !line.nsn_id)    resolve({success: false, message: 'An nsn must be specified'})
                                            else if (size._serials  && !line.serial_id) resolve({success: false, message: 'A serial # must be specified'})
                                            else if (!size._serials && !line.stock_id)  resolve({success: false, message: 'A stock location must be specified'})
                                            else {
                                                loancards.create({
                                                    user_id_loancard: issue.user_id_issue,
                                                    user_id:          line.user_id
                                                })
                                                .then(loancard => {
                                                    loancards.createLine({
                                                        loancard_id: loancard.loancard_id,
                                                        issue_id:    issue.issue_id,
                                                        size_id:     size.size_id,
                                                        serial_id:   line.serial_id || null,
                                                        nsn_id:      line.nsn_id    || null,
                                                        _qty:        line._qty      || 1,
                                                        user_id:     line.user_id
                                                    })
                                                    .then(loancard_line => {
                                                        m.stores.issue_actions.create({
                                                            issue_id:         issue.issue_id,
                                                            _action:          'Added to loancard',
                                                            serial_id:        line.serial_id || null,
                                                            stock_id:         line.stock_id  || null,
                                                            nsn_id:           line.nsn_id    || null,
                                                            loancard_line_id: loancard_line.line_id,
                                                            user_id:          line.user_id
                                                        })
                                                        .then(action => resolve({success: true, message: 'Line added to loancard'}))
                                                        .catch(err =>   resolve({success: true, message: `Line added to loancard. Error creating issue action: ${err.message}`}))
                                                    })
                                                    .catch(err => reject(err));
                                                })
                                                .catch(err => reject(err));
                                            };
                                        } else if (line._status === 5) {
                                            
                                        };
                                    })
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            };
                        })
                        .catch(err => reject(err));
                    };
                };
            })
            .catch(err => reject(err));
        })
    };
    function approveIssue(issue, line) {
        
    };
};