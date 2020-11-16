module.exports = {
    create: (options = {}) => new Promise((resolve, reject) => {
        return options.m.users.findOne(
            {where: {user_id: options.requested_for}},
            {attributes: ['user_id']}
        )
        .then(user => {
            if (!user) reject(new Error('User not found'))
            else {
                return options.m.requests.findOrCreate({
                    where: {
                        requested_for: user.user_id,
                        _status: 1
                    },
                    defaults: {user_id: options.user_id}
                })
                .then(([request, created]) => resolve({request_id: request.request_id, created: created}))
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    }),
    createLine: (options = {}) => new Promise((resolve, reject) => {
        return options.m.sizes.findOne({
            where: {size_id: options.line.size_id},
            attributes: ['size_id']
        })
        .then(size => {
            if (!size) reject(new Error('Size not found'));
            else {
                return options.m.requests.findOne({
                    where: {request_id: options.line.request_id},
                    attributes: ['_status', 'request_id']
                })
                .then(request => {
                    if (!request) reject(new Error('Request not found'))
                    else if (request._status !== 1) reject(new Error('Lines can only be added to draft requests'))
                    else {
                        return options.m.request_lines.findOrCreate({
                            where: {
                                request_id: request.request_id,
                                size_id: size.size_id
                            },
                            defaults: {
                                _qty: options.line._qty,
                                user_id: options.user_id
                            }
                        })
                        .then(([line, created]) => {
                            if (created) resolve(line.line_id)
                            else {
                                return line.increment('_qty', {by: options.line._qty})
                                .then(result => {
                                    return options.m.notes.create({
                                        _id: line.line_id,
                                        _table: 'request_lines',
                                        _system: 1,
                                        _note: `Incremented by ${options.line._qty}`,
                                        user_id: options.user_id
                                    })
                                    .then(result => resolve(line.line_id))
                                    .catch(err => reject(err));
                                    
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
    })
};