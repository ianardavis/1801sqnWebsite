module.exports = {
    create: (options = {}) => new Promise((resolve, reject) => {
        return options.m.users.findOne({
            where: {user_id: options.issued_to},
            attributes: ['user_id']
        })
        .then(user => {
            if (!user) {
                resolve({
                    success: false,
                    message: 'User not found'
                });
            } else {
                return options.m.issues.findOrCreate({
                    where: {
                        issued_to: user.user_id,
                        _status: 1
                    },
                    defaults: {user_id: options.user_id}
                })
                .then(([issue, created]) => {
                    if (created) {
                        resolve({
                            success: true,
                            message: 'Issue created',
                            issue: {
                                issue_id: issue.issue_id,
                                created: created
                            }
                        });
                    } else {
                        resolve({
                            success: true,
                            message: 'Draft issue already exists',
                            issue: {
                                issue_id: issue.issue_id,
                                created: created
                            }
                        });
                    };
                })
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    }),
    createLine: (options = {}) => new Promise((resolve, reject) => {
        // Find size
        return options.m.sizes.findOne({
            where: {size_id: options.line.size_id},
            attributes: ['_issueable', '_serials', '_nsns']
        })
        .then(size => {
            if (!size) {
                resolve({
                    success: false,
                    message: 'Size not found'
                });// If size is not found, return error
            } else if (!size._issueable) {
                resolve({
                    success: false,
                    message: 'Size not issueable'
                });//If size is not issueable, return error
            } else {
                // Find issue
                return options.m.issues.findOne({
                    where: {issue_id: options.line.issue_id},
                    attributes: ['_status', 'issue_id']
                })
                .then(issue => {
                    if (!issue) {
                        resolve({
                            success: false,
                            message: 'Issue not found'
                        });//If issue is not found return error
                    } else if (issue._status !== 1) {
                        resolve({
                            success: false,
                            message: 'Lines can can only be added to draft issues'
                        });//If issue is complete return error
                    } else {
                        //Count lines already on the issue
                        return options.m.issue_lines.count({where: {issue_id: issue.issue_id}})
                        .then(lines => {
                            if (size._serials && (!options.line.serial_id || options.line.serial_id === '')) {
                                resolve({
                                    success: false,
                                    message: 'You must specify a serial #'
                                });//If serial required and no serial return error
                            } else if (size._nsns && (!options.line.nsn_id || options.line.nsn_id === '')) {
                                resolve({
                                    success: false,
                                    message: 'You must specify an NSN'
                                });//If nsn required and no nsn return error
                            } else {
                                if (!options.line._line) options.line._line = lines + 1; //Add line number if not present
                                if (size._serials) { //If serials required
                                    //Find serial
                                    return options.m.serials.findOne({
                                        where: {serial_id: options.line.serial_id},
                                        attributes: []
                                    })
                                    .then(serial => {
                                        if (!serial) {
                                            resolve({
                                                success: false,
                                                message: 'Serial not found'
                                            });
                                        } else {
                                            //create issue line
                                            return options.m.issue_lines.create(options.line)
                                            .then(issue_line => {
                                                let actions = [];
                                                actions.push(
                                                    //Remove from stock
                                                    options.m.stock.findByPk(issue_line.stock_id)
                                                    .then(stock => stock.decrement('_qty', {by: issue_line._qty}))
                                                );
                                                if (options.line.serial_id) {
                                                    actions.push(
                                                        //If serial, update the serial as issued
                                                        options.m.serials.update(
                                                            {issue_line_id: issue_line.line_id},
                                                            {where: {serial_id: options.line.serial_id}}
                                                        )
                                                    );
                                                };
                                                return Promise.allSettled(actions)
                                                .then(result => {
                                                    resolve({
                                                        success: true,
                                                        message: 'Line issued',
                                                        line: {line_id: issue_line.line_id}
                                                    });
                                                })
                                                .catch(err => reject(err));
                                            })
                                            .catch(err => reject(err));
                                        };
                                    })
                                    .catch(err => reject(err));
                                } else {
                                    // Create issue line
                                    return options.m.issue_lines.create(options.line)
                                    .then(issue_line => {
                                        //Remove from stock
                                        return options.m.stock.findByPk(issue_line.stock_id)
                                        .then(stock => stock.decrement('_qty', {by: issue_line._qty}))
                                        .then(result => {
                                            resolve({
                                                success: true,
                                                message: 'Line issued',
                                                line: {line_id: issue_line.line_id}
                                            });
                                        })
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
                                };
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
};