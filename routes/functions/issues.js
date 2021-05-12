module.exports = function (m, fn) {
    fn.issues = {};
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
};