module.exports = function (m, orders) {
    orders.create = function (line, user_id, source = {}) {
        return new Promise((resolve, reject) => {
            return m.stores.sizes.findOne({
                where: {size_id: line.size_id},
                attributes: ['size_id', '_orderable']
            })
            .then(size => {
                if      (!size)            reject(new Error('Size not found'))
                else if (!size._orderable) reject(new Error('This size can not ordered'))
                else {
                    return m.stores.orders.findOrCreate({
                        where: {
                            size_id: size.size_id,
                            _status: 1
                        },
                        defaults: {
                            user_id: user_id,
                            _qty:    line._qty
                        }
                    })
                    .then(([order, created]) => {
                        let action = {
                            order_id: order.order_id,
                            user_id:  user_id
                        };
                        if (source.table) action[source.table.column] = source.table.id;
                        if (created) {
                            if (source.note) {
                                action._action = `Created${source.note || ''}`;
                                return m.stores.order_actions.create(action)
                                .then(action => {
                                    resolve({
                                        success:  true,
                                        message:  'Order created',
                                        order_id: order.order_id,
                                        created:  false
                                    });
                                })
                                .catch(err => {
                                    console.log(error);
                                    resolve({
                                        success:  true,
                                        message:  `Order created, error creating action: ${error.message}`,
                                        order_id: order.order_id,
                                        created:  false
                                    });
                                });
                            } else {
                                resolve({
                                    success:  true,
                                    message:  'Issue created',
                                    order_id: order.order_id,
                                    created:  true
                                });
                            };
                        } else {
                            return order.increment('_qty', {by: line._qty})
                            .then(result => {
                                action._action = `Incremented by ${line._qty}${source.note || ''}`;
                                return m.stores.order_actions.create(action)
                                .then(action => {
                                    resolve({
                                        success:  true,
                                        message:  'Existing order incremented',
                                        order_id: order.order_id,
                                        created:  false
                                    });
                                })
                                .catch(err => {
                                    console.log(error);
                                    resolve({
                                        success:  true,
                                        message:  `Existing order incremented, error creating action: ${error.message}`,
                                        order_id: order.order_id,
                                        created:  false
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
        });
    };
};