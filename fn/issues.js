module.exports = {
    createIssue: (options = {}) => new Promise((resolve, reject) => {
        options.m.issues.findOne({
            where: {
                issued_to: options.issue.issued_to,
                _complete: 0
            }
        })
        .then(_issue => {
            if (_issue) resolve({created: false, issue_id: _issue.issue_id})
            else {
                options.m.issues.create(options.issue)      
                .then(new_issue => resolve({created: true, issue_id: new_issue.issue_id}))
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    }),
    createIssueLine: (options = {}) => new Promise((resolve, reject) => {
        options.m.sizes.findOne({where: {size_id: options.line.size_id}})
        .then(size => {
            if (!size) reject(new Error('Size not found'))
            else if (size._issueable) {
                options.m.issues.findOne({where: {issue_id: options.line.issue_id}})
                .then(issue => {
                    if (!issue) reject(new Error('Issue not found'))
                    else if (issue._complete) reject(new Error('Lines can not be added to completed issues'));
                    else {
                        options.m.issue_lines.findAll({where: {issue_id: issue.issue_id}})
                        .then(lines => {
                            if (size._serials && !options.line.serial_id) reject(new Error('You must specify a serial #'));
                            else if (size._nsns && !options.line.nsn_id) reject(new Error('You must specify an NSN'));
                            else {
                                if (!options.line._line) options.line._line = lines.length + 1;
                                if (size._serials) {
                                    options.m.serials.findOne({where: {serial_id: options.line.serial_id}})
                                    .then(serial => {
                                        if (!serial) reject(new Error('Serial not found'))
                                        else {
                                            options.m.issue_lines.create(options.line)
                                            .then(issue_line => {
                                                let actions = [];
                                                actions.push(
                                                    options.m.stock.findByPk(issue_line.stock_id)
                                                    .then(stock => stock.decrement('_qty', {by: issue_line._qty}))
                                                );
                                                if (options.line.serial_id) {
                                                    actions.push(
                                                        options.m.serials.update(
                                                            {issue_line_id: issue_line.line_id},
                                                            {where: {serial_id: options.line.serial_id}}
                                                        )
                                                    );
                                                };
                                                Promise.allSettled(actions)
                                                .then(result => resolve(issue_line.line_id))
                                                .catch(err => reject(err));
                                            })
                                            .catch(err => reject(err));
                                        };
                                    })
                                    .catch(err => reject(err));
                                } else {
                                    options.m.issue_lines.create(options.line)
                                    .then(issue_line => {
                                        options.m.stock.findByPk(issue_line.stock_id)
                                        .then(stock => stock.decrement('_qty', {by: issue_line._qty}))
                                        .then(result => resolve(issue_line.line_id))
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
            } else reject(new Error('This size can not be issued'));
        })
        .catch(err => reject(err));
    })
};