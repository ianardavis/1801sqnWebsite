module.exports = {
    create: (options = {}) => new Promise((resolve, reject) => {
        return options.m.users.findOne(
            {where: {user_id: options.ordered_for}},
            {attributes: ['user_id', 'status_id']}
        )
        .then(user => {
            if (!user) {
                resolve({
                    success: false,
                    message: 'User not found'
                });
            } else if (user.status_id === 1 || user_status_id === 2) {
                resolve({
                    success: false,
                    message: 'Orders can only be made for current cadets or staff'
                });
            } else {
                return options.m.orders.findOrCreate({
                    where: {
                        ordered_for: user.user_id,
                        _status: 1
                    },
                    defaults: {user_id: options.user_id}
                })
                .then(([order, created]) => {
                    if (created) {
                        resolve({
                            success: true,
                            message: 'Order created',
                            order: {
                                order_id: order.order_id,
                                created: created
                            }
                        });
                    } else {
                        resolve({
                            success: true,
                            message: 'Order already exists',
                            order: {
                                order_id: order.order_id,
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
        return options.m.sizes.findOne({
            where: {size_id: options.size_id},
            attributes: ['_orderable', 'size_id']
        })
        .then(size => {
            if (!size) {
                resolve({
                    success: false,
                    message: 'Size not found'
                });
            } else if (!size._orderable) {
                resolve({
                    success: false,
                    message: 'This size can not be ordered'
                });
            } else {
                return options.m.orders.findOne({
                    where: {order_id: options.order_id},
                    attributes: ['order_id', '_status']
                })
                .then(order => {
                    if (!order) {
                        resolve({
                            success: false,
                            message: 'Order not found'
                        });
                    } else if (order._status !== 1) {
                        resolve({
                            success: false,
                            message: 'Lines can only be added to draft orders'
                        });
                    } else {
                        return options.m.order_lines.findOrCreate({
                            where: {
                                order_id: order.order_id,
                                size_id:  size.size_id,
                                _status:  1
                            },
                            defaults: {
                                _qty: options._qty,
                                user_id: options.user_id
                            }
                        })
                        .then(([line, created]) => {
                            if (created) {
                                resolve({
                                    success: true,
                                    message: 'Line created',
                                    line: {
                                        line_id: line.line_id,
                                        created: created
                                    }
                                });
                            } else {
                                return line.increment('_qty', {by: options._qty})
                                .then(result => {
                                    return options.m.notes.create({
                                        _id: line.line_id,
                                        _table: 'order_lines',
                                        _note: `Incremented by ${options._qty}${options.note || ''}`,
                                        user_id: options.user_id,
                                        _system: 1
                                    })
                                    .then(note => {
                                        resolve({
                                            success: true,
                                            message: 'Line incremented',
                                            line: {
                                                line_id: line.line_id,
                                                created: created
                                            }
                                        });
                                    })
                                    .catch(err => {
                                        resolve({
                                            success: true,
                                            message: 'Line incremented. Could not create note',
                                            details: err,
                                            line: {
                                                line_id: line.line_id,
                                                created: created
                                            }
                                        });
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
    })
};