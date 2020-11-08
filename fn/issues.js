module.exports = {
    create: (options = {}) => new Promise((resolve, reject) => {
        return options.m.users.findOne({
            where: {user_id: options.issued_to},
            attributes: ['user_id', 'status_id']
        })
        .then(user => {
            if (!user) {
                resolve({
                    success: false,
                    message: 'User not found'
                });
            } else if (user.status_id === 1 || user_status_id === 2) {
                resolve({
                    success: false,
                    message: 'Issues can only be made to current cadets or staff'
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
                                let verify_search = null;
                                if (size._serials) { //If serials required
                                    verify_search = options.m.serials.findOne({
                                        where: {
                                            serial_id: options.line.serial_id,
                                            size_id: options.line.size_id
                                        },
                                        attributes: ['serial_id']
                                    });
                                } else {
                                    verify_search = options.m.stock.findOne({
                                        where: {
                                            stock_id: options.line.stock_id,
                                            size_id: options.line.size_id
                                        },
                                        attributes: ['stock_id']
                                    });
                                };
                                if (verify_search) {
                                    verify_search
                                    .then(result => {
                                        if (!result) {
                                            resolve({
                                                success: false,
                                                message: 'Stock/Serial not found'
                                            });
                                        } else {
                                            //create issue line
                                            return options.m.issue_lines.create(options.line)
                                            .then(issue_line => {
                                                resolve({
                                                    success: true,
                                                    message: 'Issue line created',
                                                    line: {line_id: issue_line.line_id}
                                                });
                                            })
                                            .catch(err => reject(err));
                                        };
                                    })
                                    .catch(err => reject(err));
                                } else {
                                    resolve({
                                        success: false,
                                        message: 'No verification search'
                                    })
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