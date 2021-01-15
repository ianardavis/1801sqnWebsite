module.exports = function (m, orders) {
    orders.create = function (line, user_id, source = {}) {
        return new Promise((resolve, reject) => {
            return m.stores.sizes.findOne({
                where: {size_id: line.size_id},
                attributes: ['size_id', '_orderable', '_serials']
            })
            .then(size => {
                if      (!size)            reject(new Error('Size not found'))
                else if (!size._orderable) reject(new Error('This size can not ordered'))
                else {
                    let create_action = null;
                    if (size._serials) create_action = create_serials(line, user_id, source)
                    else               create_action = create_stock(  line, user_id, source);
                    create_action.then(result => resolve(result));
                };
            })
            .catch(err => reject(err));
        });
    };
    function create_serials(line, user_id, source = {}) {
        return new Promise((resolve, reject) => {
            let order_actions = [];
            for (let i = 0; i < line._qty; i++) {
                order_actions.push(
                    new Promise((resolve, reject) => {
                        return m.stores.orders.create({
                            size_id: line.size_id,
                            user_id: user_id,
                            _qty:    1
                        })
                        .then(order => {
                            if (source.note) {
                                let action = {
                                    order_id: order.order_id,
                                    user_id:  user_id
                                };
                                if (source.table) action[source.table.column] = source.table.id;
                                action._action = `Order created${source.note || ''}`;
                                return m.stores.actions.create(action)
                                .then(action => {
                                    resolve({
                                        success:  true,
                                        message:  'Order created',
                                        order_id: order.order_id,
                                        created:  true
                                    });
                                })
                                .catch(err => {
                                    console.log(error);
                                    resolve({
                                        success:  true,
                                        message:  `Order created, error creating action: ${error.message}`,
                                        order_id: order.order_id,
                                        created:  true
                                    });
                                });
                            } else {
                                resolve({
                                    success:  true,
                                    message:  'Order created',
                                    order_id: order.order_id,
                                    created:  true
                                });
                            };
                        })
                        .catch(err => reject(err));
                    })
                );
            };
            Promise.allSettled(order_actions)
            .then(results => {
                if (results.filter(e => e.status === 'rejected').length > 0) {
                    console.log(results);
                    reject(new Error('SOme actions failed'));
                } else resolve({success: true, message: 'Order(s) created'});
            })
            .catch(err => reject(err));
        });
    };
    function create_stock(line, user_id, source = {}) {
        return new Promise((resolve, reject) => {
            return m.stores.orders.findOrCreate({
                where: {
                    size_id: line.size_id,
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
                        action._action = `Order created${source.note || ''}`;
                        return m.stores.actions.create(action)
                        .then(action => {
                            resolve({
                                success:  true,
                                message:  'Order created',
                                order_id: order.order_id,
                                created:  true
                            });
                        })
                        .catch(err => {
                            console.log(error);
                            resolve({
                                success:  true,
                                message:  `Order created, error creating action: ${error.message}`,
                                order_id: order.order_id,
                                created:  true
                            });
                        });
                    } else {
                        resolve({
                            success:  true,
                            message:  'Order created',
                            order_id: order.order_id,
                            created:  true
                        });
                    };
                } else {
                    return order.increment('_qty', {by: line._qty})
                    .then(result => {
                        action._action = `Order incremented by ${line._qty}${source.note || ''}`;
                        return m.stores.actions.create(action)
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
        });
    };
};