module.exports = {
    create: (options = {}) => new Promise((resolve, reject) => {
        options.m.requests.findOrCreate({
            where: {
                requested_for: options.request.requested_for,
                _complete: 0
            },
            defaults: {
                user_id: options.user_id,
                _date: Date.now()
            }
        })
        .then(result => resolve({request_id: result[0].request_id, created: result[1]}))
        .catch(err => reject(err));
    }),
    createLine: (options = {}) => new Promise((resolve, reject) => {
        options.m.sizes.findOne({where: {size_id: options.line.size_id}})
        .then(size => {
            if (size) {
                options.m.request.findOne({where: {request_id: options.line.request_id}})
                .then(request => {
                    if (!request) reject(new Error('Request not found'))
                    else if (request._complete) reject(new Error('Lines can not be added to completed requests'))
                    else {
                        options.m.request_lines.findOne({
                            where: {
                                request_id: request.request_id,
                                size_id: size.size_id
                            }
                        })
                        .then(requestline => {
                            if (requestline) {
                                options.m.request_lines.findByPk(requestline.line_id)
                                .then(stock => stock.increment('_qty', {by: options.line._qty}))
                                .then(new_qty => resolve(requestline.line_id))
                                .catch(err => reject(err));
                            } else {
                                options.m.request_lines.create(options.line)
                                .then(request_line => resolve(request_line.line_id))
                                .catch(err => reject(err));
                            };
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            } else reject(new Error('Size not found'))
        })
        .catch(err => reject(err));
    })
};