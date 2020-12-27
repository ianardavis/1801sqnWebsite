module.exports = function (m, issues) {
    issues.create = function (issued_to, user_id) {
        return new Promise((resolve, reject) => {
            return m.users.users.findOne({
                where: {user_id: issued_to},
                attributes: ['user_id', 'status_id']
            })
            .then(user => {
                if      (!user)                                        resolve({success: false, message: 'User not found'})
                else if (user.status_id !== 1 && user_status_id !== 2) resolve({success: false, message: 'Issues can only be made to current cadets or staff'})
                else {
                    return m.stores.issues.findOrCreate({
                        where: {
                            issued_to: user.user_id,
                            _status: 1
                        },
                        defaults: {user_id: user_id}
                    })
                    .then(([issue, created]) => {
                        if (created) resolve({success: true, message: 'Issue created',              issue_id: issue.issue_id, created: created})
                        else         resolve({success: true, message: 'Draft issue already exists', issue_id: issue.issue_id, created: created});
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    issues.createLine = function (options = {}) {
        return new Promise((resolve, reject) => {
            // Find size
            return m.stores.sizes.findOne({
                where: {size_id: options.size_id},
                attributes: ['size_id', '_issueable', '_serials', '_nsns']
            })
            .then(size => {
                if      (!size)            resolve({success: false, message: 'Size not found'});
                else if (!size._issueable) resolve({success: false, message: 'Size not issueable'});
                else {
                    return m.stores.issues.findOne({
                        where: {issue_id: options.issue_id},
                        attributes: ['_status', 'issue_id']
                    })
                    .then(issue => {
                        if      (!issue)              resolve({success: false, message: 'Issue not found'})
                        else if (issue._status !== 1) resolve({success: false, message: 'Lines can can only be added to draft issues'})
                        else {
                            return m.stores.issue_lines.count({where: {issue_id: issue.issue_id}})
                            .then(lines => {
                                if      (size._serials && (!options.serial_id || options.serial_id === '')) resolve({success: false, message: 'You must specify a serial #'})
                                else if (size._nsns && (!options.nsn_id || options.nsn_id === ''))          resolve({success: false, message: 'You must specify an NSN'})
                                else {
                                    if (!options._line) options._line = lines + 1; //Add line number if not present
                                    let verify_search = null;
                                    if (size._serials) { //If serials required
                                        verify_search = m.stores.serials.findOne({
                                            where: {
                                                serial_id: options.serial_id,
                                                size_id: options.size_id
                                            },
                                            attributes: ['serial_id', 'location_id']
                                        });
                                    } else {
                                        verify_search = m.stores.stock.findOne({
                                            where: {
                                                stock_id: options.stock_id,
                                                size_id: options.size_id
                                            },
                                            attributes: ['stock_id', 'location_id']
                                        });
                                    };
                                    if (verify_search) {
                                        return verify_search
                                        .then(result => {
                                            if (!result) resolve({success: false, message: 'Stock/Serial not found'});
                                            else {
                                                //create issue line
                                                return m.stores.issue_lines.create({
                                                    issue_id:    options.issue_id,
                                                    size_id:     options.size_id,
                                                    serial_id:   options.serial_id || null,
                                                    stock_id:    options.stock_id  || null,
                                                    nsn_id:      options.nsn_id    || null,
                                                    location_id: result.location_id,
                                                    _line:       options._line,
                                                    _qty:        options._qty,
                                                    user_id:     options.user_id
                                                })
                                                .then(issue_line => resolve({success: true, message: 'Issue line created', line_id: issue_line.line_id}))
                                                .catch(err => reject(err));
                                            };
                                        })
                                        .catch(err => reject(err));
                                    } else resolve({success: false, message: 'No verification search'})
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
};