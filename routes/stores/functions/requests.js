module.exports = function (m, requests) {
    requests.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            return m.users.users.findOne(
                {where: {user_id: options.user_id_request}},
                {attributes: ['user_id']}
            )
            .then(user => {
                if (!user) resolve({success: false, message: 'User not found'})
                else {
                    return m.stores.requests.findOrCreate({
                        where: {
                            user_id_request: user.user_id,
                            _status: 1
                        },
                        defaults: {user_id: options.user_id}
                    })
                    .then(([request, created]) => {
                        if (created) resolve({success: true, message: `Request created: ${request.request_id}`})
                        else         resolve({success: true, message: `Request already in draft for this user: ${request.request_id}`})
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    requests.createLine = function (options = {}) {
        return new Promise((resolve, reject) => {
            return m.stores.sizes.findOne({
                where: {size_id: options.line.size_id},
                attributes: ['size_id']
            })
            .then(size => {
                if (!size) resolve({success: false, message: 'Size not found'})
                else {
                    return m.stores.requests.findOne({
                        where: {request_id: options.line.request_id},
                        attributes: ['_status', 'request_id']
                    })
                    .then(request => {
                        if      (!request)              resolve({success: false, message: 'Request not found'})
                        else if (request._status !== 1) resolve({success: false, message: 'Lines can only be added to draft requests'})
                        else {
                            return m.stores.request_lines.findOrCreate({
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
                                if (created) resolve({success: true, message: 'Line created'})
                                else {
                                    return line.increment('_qty', {by: options.line._qty})
                                    .then(result => {
                                        return line.reload()
                                        .then(line => {
                                            return m.stores.request_line_actions.create({
                                                request_line_id: line.line_id,
                                                _action: `Incremented by ${options.line._qty}`,
                                                user_id: options.user_id
                                            })
                                            .then(result => resolve({success: true, message: 'Line incremented'}))
                                            .catch(err => reject(err));
                                        })
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
        });
    };
};