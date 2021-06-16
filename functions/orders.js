module.exports = function (m, fn) {
    fn.orders = {};
    fn.orders.create = function (line, user_id, issue_id = null) {
        return new Promise((resolve, reject) => {
            return fn.get('sizes', {size_id: line.size_id})
            .then(size => {
                if (!size.orderable) reject(new Error('This size can not ordered'))
                else {
                    return m.orders.findOrCreate({
                        where: {
                            size_id: size.size_id,
                            status:  1
                        },
                        defaults: {
                            qty:     line.qty,
                            user_id: user_id
                        }
                    })
                    .then(([order, created]) => {
                        let actions = [];
                        if (!created) {
                            actions.push(order.increment('qty', {by: line.qty}));
                            actions.push(
                                fn.actions.create({
                                    action:  `Order incremented${(issue_id ? ' from issue' : '')}`,
                                    user_id: user_id,
                                    links: [
                                        {table: 'issues', id: issue_id},
                                        {table: 'orders', id: order.order_id}
                                    ]
                                })
                            )
                        } else if (issue_id) actions.push(
                            fn.actions.create({
                                action:  'Order created from issue',
                                user_id: user_id,
                                links: [
                                    {table: 'issues', id: issue_id},
                                    {table: 'orders', id: order.order_id}
                                ]
                            })
                        );
                        return Promise.all(actions)
                        .then(result => resolve(true))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.orders.demand = function (orders, user_id) {
        return new Promise((resolve, reject) => {
            return fn.allowed(user_id, 'demand_line_add')
            .then(result => {
                let order_actions = [], suppliers = [];
                orders.forEach(order => {
                    order_actions.push(new Promise((resolve, reject) => {
                        return fn.get(
                            'orders',
                            {order_id: order.order_id},
                            [{
                                model: m.sizes,
                                as: 'size',
                                include: [{
                                    model: m.suppliers,
                                    as: 'supplier'
                                }]
                            }]
                        )
                        .then(order => {
                            if      (order.status !== 1)    reject(new Error('Only placed orders can be demanded'))
                            else if (!order.size)           reject(new Error('Size not found'))
                            else if (!order.size.orderable) reject(new Error('Size can not be ordered'))
                            else if (!order.size.supplier)  reject(new Error('Supplier not found'))
                            else if (suppliers.find(e => e.supplier_id === order.size.supplier_id)) {
                                suppliers.find(e => e.supplier_id === order.size.supplier_id).orders.push(order);
                                resolve(true);
                            } else {
                                suppliers.push({supplier_id: order.size.supplier_id, orders: [order]});
                                resolve(true);
                            };
                        })
                        .catch(err => reject(err));
                    }));
                });
                return Promise.allSettled(order_actions)
                .then(results => {
                    let demand_actions = [];
                    suppliers.forEach(supplier => {
                        demand_actions.push(new Promise((resolve, reject) => {
                            return fn.demands.create({
                                supplier_id: supplier.supplier_id,
                                user_id:     user_id
                            })
                            .then(demand => {
                                let line_actions = [];
                                supplier.orders.forEach(order => {
                                    line_actions.push(new Promise((resolve, reject) => {
                                        return fn.demands.lines.create({
                                            demand_id: demand.demand_id,
                                            size_id:   order.size_id,
                                            qty:       order.qty,
                                            order_id:  order.order_id,
                                            user_id:   user_id
                                        })
                                        .then(demand_line_id => {
                                            return order.update({status: 2})
                                            .then(result => {
                                                if (!result) reject(new Error('Order not updated'))
                                                else {
                                                    return fn.actions.create({
                                                        action: 'Order added to demand',
                                                        user_id: user_id,
                                                        links: [
                                                            {table: 'orders',       id: order.order_id},
                                                            {table: 'demand_lines', id: demand_line_id}
                                                        ]
                                                    })
                                                    .then(action => resolve(demand_line_id))
                                                    .catch(err => resolve(demand_line_id));
                                                };
                                            })
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    }));
                                });
                                return Promise.allSettled(line_actions)
                                .then(results => resolve(true))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        }));
                    });
                    return Promise.allSettled(demand_actions)
                    .then(results => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.orders.receive = function (_order, user_id) {
        return new Promise((resolve, reject) => {
            fn.allowed(user_id, 'order_edit')
            .then(allowed => {
                return fn.get(
                    'orders',
                    {order_id: _order.order_id},
                    [{
                        model: m.sizes,
                        as: 'size',
                        include: [{
                            model: m.suppliers,
                            as: 'supplier'
                        }]
                    }]
                )
                .then(order => {
                    if      (!order.size)        reject(new Error('Size not found'))
                    else if (order.status !== 1) reject(new Error('Only placed orders can be received'))
                    else {
                        let action = null;
                        if (order.size.has_serials) {
                            action = new Promise((resolve, reject) => {
                                let serial_actions = [];
                                _order.serials.forEach(serial => {
                                    serial_actions.push(new Promise((resolve, reject) => {
                                        if (!serial.location) reject(new Error('No location specified'))
                                        else {
                                            return m.locations.findOrCreate({where: {location: serial.location}})
                                            .then(([location, created]) => {
                                                
                                            })
                                            .catch(err => reject(err));
                                        };
                                    }));
                                });
                                return Promise.all(serial_actions)
                                .then(results => {

                                })
                                .catch(err => reject(err));
                            });
                        } else {
                            action = new Promise((resolve, reject) => {
                                if (!_order.location) reject(new Error('No location specified'))
                                else {
                                    return m.locations.findOrCreate({where: {location: _order.location}})
                                    .then(([location, created]) => {
                                        return m.stocks.findOrCreate({
                                            where: {
                                                size_id:     order.size_id,
                                                location_id: location.location_id
                                            }
                                        })
                                    })
                                    .catch(err => reject(err));
                                };
                            });
                        };
                        return action
                        .then(result => {

                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};