module.exports = function (m, fn) {
    fn.orders = {};
    function create_normalise_lines(lines) {
        return new Promise(resolve => {
            let sizes = [];
            lines.forEach(line => {
                if (line.qty && line.qty > 0) {
                    let index = sizes.findIndex(e => e.size_id === line.size_id);
                    if (index === -1) {
                        sizes.push({
                            size_id: line.size_id,
                            qty: Number(line.qty),
                            issue_ids: (line.issue_id ? [line.issue_id] : [])
                        });
                    } else {
                        if (line.issue_id) sizes[index].issue_ids.push(line.issue_id);
                        sizes[index].qty += Number(line.qty);
                    };
                };
            });
            resolve(sizes);
        });
    };
    fn.orders.createBulk = function (orders, user_id) {
        return new Promise((resolve, reject) => {
            if (!orders || orders.length === 0) reject(new Error('No orders'))
            else {
                create_normalise_lines(orders)
                .then(sizes => {
                    let order_actions = [];
                    sizes.forEach(size => {
                        order_actions.push(
                            fn.orders.create(size.size_id, size.qty, user_id, size.issue_ids)
                        );
                    });
                    Promise.allSettled(order_actions)
                    .then(results => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            };
        });
    };
    fn.orders.cancel     = function (order_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.allowed(user_id, 'stock_admin', true)
            .then(allowed => {
                fn.get(
                    'orders',
                    {order_id: order_id}
                )
                .then(order => {
                    if      (order.status === 0) reject(new Error('Order has already been cancelled'))
                    else if (order.status === 3) reject(new Error('Order has already been received'))
                    else if (order.status === 1 || order.status === 2) {
                        update_order_status(order, 0, user_id)
                        .then(action => {
                            get_issues_for_order(order.order_id)
                            .then(result => {
                                let oa = [];
                                result.order_links.forEach(e => oa.push(fn.update(e, {active: false})));
                                Promise.allSettled(oa)
                                .then(update_result => {
                                    let actions = [];
                                    result.issue_ids.forEach(issue_id => {
                                        actions.push(new Promise((resolve, reject) => {
                                            fn.get(
                                                'issues',
                                                {issue_id: issue_id}
                                            )
                                            .then(issue => {
                                                if (issue.status === 3) {
                                                    fn.update(issue, {status: 2})
                                                    .then(result => resolve(issue.issue_id))
                                                    .catch(err => reject(err));
                                                } else reject(new Error('Order is not in "ordered" status'));
                                            })
                                            .catch(err => reject(err));
                                        }));
                                    });
                                    Promise.allSettled(actions)
                                    .then(results => {
                                        links = [];
                                        results.filter(e => e.status === 'fulfilled').forEach(issue => {
                                            links.push({table: 'issues', id: issue.value})
                                        });
                                        fn.actions.create(
                                            'ORDER | CANCELLED',
                                            user_id,
                                            [{table: 'orders', id: order.order_id}].concat(links)
                                        )
                                        .then(action => resolve(true))
                                        .catch(err => {
                                            console.log(err);
                                            resolve(false);
                                        });
    
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        resolve(false);
                                    });
                                })
                                .catch(err => {
                                    console.log(err);
                                    resolve(false);
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                resolve(false);
                            });
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function get_issues_for_order(order_id) {
        return new Promise((resolve, reject) => {
            m.action_links.findAll({
                where: {
                    _table: 'orders',
                    id:     order_id,
                    active: true
                },
                include: [{
                    model: m.actions,
                    where: {
                        action: {[fn.op.or]: [
                            {[fn.op.startsWith]: 'ORDER | CREATED'},
                            {[fn.op.startsWith]: 'ORDER | INCREMENTED'}
                        ]}
                    },
                    include: [{
                        model: m.action_links,
                        as: 'links',
                        where: {
                            _table: 'issues',
                            active: true
                        }
                    }]
                }]
            })
            .then(links => {
                let issue_ids = [];
                links.forEach(link => link.action.links.forEach(e => issue_ids.push(e.id)));
                resolve({order_links: links, issue_ids: issue_ids});
            })
            .catch(err => reject(err));
        });
    };
    fn.orders.restore    = function (order_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.allowed(user_id, 'stock_admin')
            .then(result => {
                fn.get(
                    'orders',
                    {order_id: order_id}
                )
                .then(order => {
                    if (order.status !== 0) reject(new Error('Order is not cancelled'))
                    else {
                        update_order_status(order, 1, user_id, 'ORDER | RESTORED')
                        .then(action => resolve(true))
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.orders.create     = function (size_id, qty, user_id, issue_ids = []) {
        return new Promise((resolve, reject) => {
            fn.get('sizes', {size_id: size_id})
            .then(size => {
                if (!size.orderable) reject(new Error('This size can not ordered'))
                else {
                    m.orders.findOrCreate({
                        where: {
                            size_id: size.size_id,
                            status:  1
                        },
                        defaults: {
                            qty:     qty,
                            user_id: user_id
                        }
                    })
                    .then(([order, created]) => {
                        if (!Array.isArray(issue_ids)) issue_ids = [issue_ids]
                        let links = [];
                        if (issue_ids && issue_ids.length > 0) {
                            issue_ids.forEach(id => links.push({table: 'issues', id: id}));
                        };
                        if (created) {
                            fn.actions.create(
                                'ORDER | CREATED',
                                user_id,
                                [
                                    {table: 'orders', id: order.order_id}
                                ].concat(links)
                            )
                            .then(action => resolve(true))
                            .catch(err => resolve(true));
                        } else {
                            fn.increment(order, qty)
                            .then(result => {
                                fn.actions.create(
                                    `ORDER | INCREMENTED | By ${qty}`,
                                    user_id,
                                    [
                                        {table: 'orders', id: order.order_id}
                                    ].concat(links)
                                )
                                .then(action => resolve(true))
                                .catch(err => resolve(true));
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
    fn.orders.demand     = function (orders, user_id) {
        return new Promise((resolve, reject) => {
            fn.allowed(user_id, 'authorised_demander')
            .then(result => {
                let order_actions = [], suppliers = [];
                orders.forEach(order => {
                    order_actions.push(new Promise((resolve, reject) => {
                        fn.get(
                            'orders',
                            {order_id: order.order_id},
                            [{},fn.inc.stores.size({supplier: true})]
                        )
                        .then(order => {
                            if      ( order.status !== 1)   reject(new Error('Only placed orders can be demanded'))
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
                Promise.allSettled(order_actions)
                .then(results => {
                    let demand_actions = [];
                    suppliers.forEach(supplier => {
                        demand_actions.push(new Promise((resolve, reject) => {
                            fn.demands.create({
                                supplier_id: supplier.supplier_id,
                                user_id:     user_id
                            })
                            .then(demand => {
                                let line_actions = [];
                                supplier.orders.forEach(order => {
                                    line_actions.push(new Promise((resolve, reject) => {
                                        fn.demands.lines.create({
                                            demand_id: demand.demand_id,
                                            size_id:   order.size_id,
                                            qty:       order.qty,
                                            order_id:  order.order_id,
                                            user_id:   user_id
                                        })
                                        .then(demand_line_id => {
                                            update_order_status(order, 2, user_id, 'ORDER | DEMANDED')
                                            .then(result => resolve(demand_line_id))
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    }));
                                });
                                Promise.allSettled(line_actions)
                                .then(results => resolve(true))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        }));
                    });
                    Promise.allSettled(demand_actions)
                    .then(results => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.orders.receive    = function (_order, user_id, links = []) {
        return new Promise((resolve, reject) => {
            fn.allowed(user_id, 'authorised_demander')
            .then(allowed => {
                fn.get(
                    'orders',
                    {order_id: _order.order_id},
                    [fn.inc.stores.size({supplier: true})]
                )
                .then(order => {
                    if      (!order.size)        reject(new Error('Could not find size'))
                    else if (order.status === 0) reject(new Error('Order has been cancelled already'))
                    else if (order.status === 2) reject(new Error('Order has been demanded. Receipt must be processed through the demand'))
                    else if (order.status === 3) reject(new Error('Order has been received already'))
                    else if (order.status === 1) {
                        let action = null;
                        if (order.size.has_serials) action = receive_serials(order, _order.serials, user_id)
                        else                        action = receive_stock(  order, _order,         user_id)
                        action
                        .then(receive_result => {
                            receive_qty_variance(order, receive_result.qty, user_id)
                            .then(qty_result => {
                                update_order_status(
                                    qty_result.order,
                                    3,
                                    user_id,
                                    `ORDER | RECEIVED${qty_result.action || ''}`,
                                    links.concat(result.links || []).concat(receive_result.links || [])
                                )
                                .then(result => resolve(qty_result.order))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    }
                    else reject(new Error('Unknown order status'));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function receive_serials(order, serials, user_id) {
        return new Promise((resolve, reject) => {
            let actions = [];
            serials.forEach(serial => {
                actions.push(
                    fn.serials.receive(
                        serial.location,
                        serial.serial,
                        order.size_id,
                        user_id
                    )
                )
            });
            Promise.allSettled(actions)
            .then(results => {
                let serials = results.filter(e => e.status === 'fulfilled'),
                    qty = serials.length;
                if (qty && qty > 0) {
                    let links = [];
                    serials.forEach(serial => {
                        if (links.indexOf({table: 'locations', id: serial.value.location_id}) === -1) {
                            links.push({table: 'locations', id: serial.value.location_id});
                        };
                        links.push({table: 'serials', id: serial.value.serial_id})
                    });
                    resolve({order: order, qty: qty, links: links});
                } else reject(new Error('No successful receipts'));
            })
            .catch(err => reject(err));
        });
    };
    function receive_stock(order, receipt, user_id) {
        return new Promise((resolve, reject) => {
            fn.stocks.receive({
                qty:          receipt.qty,
                user_id:      user_id,
                action_links: [{table: 'orders', id: order.order_id}],
                stock: {
                    size_id: order.size_id,
                    location: receipt.location
                },
            })
            .then(result => resolve({order: order, qty: receipt.qty}))
            .catch(err => reject(err));
        });
    };
    function receive_qty_variance(order, qty, user_id) {
        return new Promise((resolve, reject) => {
            let qty_original = order.qty;
            if (qty > qty_original) {
                fn.update(order, {qty: qty})
                .then(result => resolve({
                    action: ` | Order qty increased from ${qty_original} to ${qty} on receipt`,
                    order:  order
                }))
                .catch(err => reject(err));
            } else if (qty < qty_original) {
                m.orders.create({
                    size_id: order.size_id,
                    qty:     qty,
                    status:  3,
                    user_id: user_id
                })
                .then(new_order => {
                    fn.decrement(order, qty)
                    .then(result => resolve({
                        action: ` | Partial receipt | New order created for receipt qty | Existing order qty updated from ${order.qty} to ${order.qty - qty}`,
                        links: [{table: 'orders', id: new_order.order_id}],
                        order: new_order
                    }))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            } else resolve({order: order});
        });
    };

    function update_order_status(order, status, user_id, action, links = []) {
        return new Promise((resolve, reject) => {
            fn.update(order, {status: status})
            .then(result => {
                if (action) {
                    fn.actions.create(
                        action,
                        user_id,
                        [
                            {table: 'orders', id: order.order_id}
                        ].concat(links)
                    )
                    .then(action => resolve(true))
                    .catch(err => reject(err));
                } else resolve(true);
            })
            .catch(err => reject(err));
        });
    };
};