module.exports = function (m, orders) {
    orders.create = function (ordered_for, user_id) {
        return new Promise((resolve, reject) => {
            return m.users.users.findOne(
                {where: {user_id: ordered_for}},
                {attributes: ['user_id', 'status_id']}
            )
            .then(user => {
                if      (!user)                                        resolve({success: false, message: 'User not found'});
                else if (user.status_id === 1 || user_status_id === 2) resolve({success: false, message: 'Orders can only be made for current cadets or staff'});
                else {
                    return m.stores.orders.findOrCreate({
                        where: {
                            ordered_for: user.user_id,
                            _status: 1
                        },
                        defaults: {user_id: user_id}
                    })
                    .then(([order, created]) => {
                        if (created) resolve({success: true, message: 'Order created',        order_id: order.order_id, created: created})
                        else         resolve({success: true, message: 'Order already exists', order_id: order.order_id, created: created});
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    orders.createLine = function (options = {}) {
        return new Promise((resolve, reject) => {
            return m.stores.sizes.findOne({
                where: {size_id: options.size_id},
                attributes: ['_orderable', 'size_id']
            })
            .then(size => {
                if      (!size)            resolve({success: false, message: 'Size not found'})
                else if (!size._orderable) resolve({success: false, message: 'This size can not be ordered'})
                else {
                    return m.stores.orders.findOne({
                        where: {order_id: options.order_id},
                        attributes: ['order_id', '_status']
                    })
                    .then(order => {
                        if      (!order)              resolve({success: false, message: 'Order not found'})
                        else if (order._status !== 1) resolve({success: false, message: 'Lines can only be added to draft orders'});
                        else {
                            return m.stores.order_lines.findOrCreate({
                                where: {
                                    order_id: order.order_id,
                                    size_id:  size.size_id,
                                    _status:  1
                                },
                                defaults: {
                                    _qty:    options._qty,
                                    user_id: options.user_id
                                }
                            })
                            .then(([line, created]) => {
                                if (created) resolve({success: true, message: 'Line created', line_id: line.line_id, created: created});
                                else {
                                    return line.increment('_qty', {by: options._qty})
                                    .then(result => {
                                        return m.stores.order_line_actions.create({
                                            order_line_id: line.line_id,
                                            _action:       `Incremented by ${options._qty}${options.note || ''}`,
                                            user_id:       options.user_id,
                                        })
                                        .then(note => resolve({success: true, message: 'Line incremented',                   line_id: line.line_id, created: created}))
                                        .catch(err => resolve({success: true, message: 'Line incremented. Note not created', line_id: line.line_id, created: created, details: err}));
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