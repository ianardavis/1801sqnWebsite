const statuses = {0: 'cancelled', 1: 'placed', 2: 'demanded', 3: 'received'};
module.exports = function (m, fn) {
    fn.orders = {};
    fn.orders.get     = function (where, include = []) {
        return fn.get(
            m.orders,
            where,
            [
                fn.inc.stores.size({supplier: true}),
                fn.inc.stores.issues()
            ].concat(include)
        )
    };
    fn.orders.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.orders.findAndCountAll({
                where: where,
                include: [
                    fn.inc.stores.size(),
                    fn.inc.users.user()
                ],
                ...pagination
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
    fn.orders.count   = function (where) {return m.orders.count({where: where})};
    fn.orders.sum     = function (where) {return m.orders.sum('qty', {where: where})};
    
    function update_order_status([order, status, user_id, action, links = []]) {
        return new Promise((resolve, reject) => {
            fn.update(order, {status: status})
            .then(result => {
                if (action) {
                    fn.actions.create([
                        action,
                        user_id,
                        [
                            {_table: 'orders', id: order.order_id}
                        ].concat(links)
                    ])
                    .then(action => resolve(order));

                } else {
                    resolve(true);

                };
            })
            .catch(reject);
        });
    };
    
    fn.orders.mark_as     = function (order_id, status, user_id) {
        function check() {
            if (status in statuses) {
                return new Promise((resolve, reject) => {
                    fn.orders.get({order_id: order_id})
                    .then(order => {
                        if (order.status === Number(status)) {
                            reject(new Error('Status has not changed'));
    
                        } else {
                            resolve([
                                order,
                                Number(status),
                                user_id,
                                `${statuses[status].toUpperCase()} | Set manually`
                            ]);
    
                        };
                    })
                    .catch(reject);
                });
    
            } else {
                return Promise.reject(new Error('Invalid status'));
    
            };
        };
        return new Promise((resolve, reject) => {
            check()
            .then(update_order_status)
            .then(order => resolve(`Order marked as ${statuses[status]}`))
            .catch(reject);
        });
    };

    fn.orders.create_bulk = function (orders, user_id) {
        if (!orders || orders.length === 0) {
            return Promise.reject(new Error('No orders'));

        } else {
            function check_for_duplicate_lines() {
                return new Promise(resolve => {
                    let sizes = [];
                    orders.forEach(line => {
                        if (line.qty && line.qty > 0) {
                            let index = sizes.findIndex(e => e.size_id === line.size_id);
                            if (index === -1) {
                                sizes.push({
                                    size_id: line.size_id,
                                    qty: Number(line.qty)
                                });
        
                            } else {
                                sizes[index].qty += Number(line.qty);
        
                            };
                        };
                    });
                    resolve(sizes);
                });
            };
            return new Promise((resolve, reject) => {
                check_for_duplicate_lines()
                .then(sizes => {
                    let order_actions = [];
                    sizes.forEach(size => {
                        order_actions.push(
                            fn.orders.create(size.size_id, size.qty, user_id)
                        );
                    });
                    Promise.allSettled(order_actions)
                    .then(results => resolve(true))
                    .catch(reject);
                })
                .catch(reject);
            });
        };
    };

    fn.orders.create      = function (size_id, qty, user_id, issues = []) {
        function create_or_increment_order(size_id) {
            return new Promise((resolve, reject) => {
                m.orders.findOrCreate({
                    where: {
                        size_id: size_id,
                        status:  1
                    },
                    defaults: {
                        qty:     qty,
                        user_id: user_id
                    }
                })
                .then(([order, created]) => {
                    if (created) {
                        resolve(order);
        
                    } else {
                        order.increment('qty', {by: qty})
                        .then(result => {
                            if (result) {
                                resolve(order);
        
                            } else {
                                reject(new Error('Existing order not incremented'));

                            };
                        })
                        .catch(reject);
        
                    };
                })
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            fn.sizes.get({size_id: size_id})
            .then(size => {
                if (!size.orderable) {
                    reject(new Error('This size can not ordered'));

                } else {
                    create_or_increment_order(size.size_id)
                    .then(order => {
                        let links = [];
                        issues.forEach(issue => {links.push({_table: 'issues', id: issue.issue_id})});
                        fn.actions.create([
                            'ORDER | CREATED',
                            user_id,
                            [{_table: 'orders', id: order.order_id}].concat(links)
                        ])
                        .then(action => resolve(order));
                    })
                    .catch(reject);

                };
            })
            .catch(reject);
        });
    };

    fn.orders.update      = function (lines, user_id) {
        function sort_orders([orders, submitted]) {
            return new Promise((resolve, reject) => {
                let actions = [];
                orders.filter(e => e.status === '-3').forEach(order => {
                    actions.push(fn.orders.restore(order.order_id, user_id));
                })

                orders.filter(e => e.status === '0').forEach(order => {
                    actions.push(fn.orders.cancel( order.order_id, user_id));
                });
    
                orders.filter(e => e.status === '3').forEach(order => {
                    actions.push(fn.orders.receive(order.order_id, order, user_id));
                });
    
                const to_demand = orders.filter(e => e.status === '2');
                if (to_demand.length > 0) {
                    actions.push(fn.orders.demand(to_demand, user_id));
                };
    
                if (actions.length > 0) {
                    resolve([actions, submitted]);
    
                } else {
                    reject(new Error('No actions to perform'));
    
                };
            });
        };
        return new Promise((resolve, reject) => {
            fn.check_for_valid_lines_to_update(lines)
            .then(sort_orders)
            .then(([actions, submitted]) => {
                Promise.allSettled(actions)
                .then(results => {
                    const resolved = results.filter(e => e.status ==='fulfilled').length;
                    const message = `${resolved} of ${submitted} tasks completed`;
                    resolve(message)
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };

    fn.orders.cancel      = function (order_id, user_id) {
        function check() {
            return new Promise((resolve, reject) => {
                fn.orders.get({order_id: order_id})
                .then(order => {
                    if (order.status === 0) {
                        reject(new Error('Order has already been cancelled'));
    
                    } else if (order.status === 3) {
                        reject(new Error('Order has already been received'));
    
                    } else if (order.status === 1 || order.status === 2) {
                        resolve([order, 0, user_id]);
    
                    } else {
                        reject(new Error('Unknown order status'));
    
                    };
                })
                .catch(reject);
            });
        };
        function update_issues(issues) {
            return new Promise((resolve, reject) => {
                let actions = [];
                issues.forEach(issue => {
                    actions.push(new Promise((resolve, reject) => {
                        let record = {order_id: null};
                        if (issue.status === 3) record.status = 2;
                        
                        fn.update(issue, record)
                        .then(result => resolve({_table: 'issues', id: issue.issue_id}))
                        .catch(reject);
                    }));
                });
                Promise.all(actions)
                .then(links => resolve(links))
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            check()
            .then(update_order_status)
            .then(order => {
                update_issues(order.issues)
                .then(links => {
                    fn.actions.create([
                        'ORDER | CANCELLED',
                        user_id,
                        [{_table: 'orders', id: order.order_id}].concat(links)
                    ])
                    .then(action => resolve(true));
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };

    fn.orders.restore     = function (order_id, user_id) {
        function check() {
            return new Promise((resolve, reject) => {
                fn.orders.get({order_id: order_id})
                .then(order => {
                    if (order.status !== 0) {
                        reject(new Error('Order is not cancelled'));
    
                    } else {
                        resolve([order, 1, user_id]);
    
                    };
                })
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            check()
            .then(update_order_status)
            .then(order => {
                fn.actions.create([
                    'ORDER | RESTORED',
                    user_id,
                    [{_table: 'orders', id: order.order_id}]
                ])
                .then(action => resolve(true));
            })
            .catch(reject);
        });
    };

    fn.orders.demand      = function (orders, user_id) {
        function sort_orders_by_supplier(orders) {
            function get_orders() {
                function check_order(order) {
                    return new Promise((resolve, reject) => {
                        if (order.status !== 1) {
                            reject(new Error('Only placed orders can be demanded'));
    
                        } else if (!order.size) {
                            reject(new Error('Size not found'));
    
                        } else if (!order.size.orderable) {
                            reject(new Error('Size can not be ordered'));
    
                        } else if (!order.size.supplier) {
                            reject(new Error('Supplier not found'));
    
                        } else {
                            resolve(order);
    
                        };
                    });
                };
                return new Promise((resolve, reject) => {
                    let actions = [];
                    orders.forEach(order => {
                        actions.push(new Promise((resolve, reject) => {
                            fn.orders.get({order_id: order.order_id})
                            .then(check_order)
                            .then(resolve)
                            .catch(reject);
                        }));
                    });
                    Promise.allSettled(actions)
                    .then(fn.check_results)
                    .then(resolve)
                    .catch(reject);
                });
            };
            function sort_orders(orders) {
                let suppliers = [];
                orders.forEach(order => {
                    let index = suppliers.findIndex(e => e.supplier_id === order.size.supplier_id);
                    if (index === -1) {
                        suppliers.push({
                            supplier_id: order.size.supplier_id,
                            sizes: [{
                                size_id: order.size_id,
                                orders:  [order]
                            }]
                        });

                    } else {
                        let size_index = suppliers[index].sizes.findIndex(e => e.size_id === order.size_id);
                        if (size_index === -1) {
                            suppliers[index].sizes.push({
                                size_id: order.size_id,
                                orders:  [order]
                            });

                        } else {
                            suppliers[index].sizes[size_index].orders.push(order);

                        };

                    };
                });
                return suppliers;
            };
            return new Promise((resolve, reject) => {
                get_orders()
                .then(sort_orders)
                .then(resolve)
                .catch(reject);
            });
        };
        function demand_sizes(suppliers) {
            function add_sizes_to_demand([demand, supplier]) {
                return new Promise((resolve, reject) => {
                    let actions = [];
                    supplier.sizes.forEach(size => {
                        actions.push(new Promise((resolve, reject) => {
                            fn.demands.lines.create(
                                size.size_id,
                                demand.demand_id,
                                user_id,
                                size.orders
                            )
                            .then(demand_line_id => {
                                let order_updates = [];
                                size.orders.forEach(e => order_updates.push(update_order_status([e, 2, user_id])));
                                Promise.all(order_updates)
                                .then(results => resolve(demand_line_id))
                                .catch(reject);
                            })
                            .catch(reject);
                        }));
                    });
                    Promise.allSettled(actions)
                    .then(results => resolve(true))
                    .catch(reject);
                });
            };
            return new Promise((resolve, reject) => {
                let actions = [];
                suppliers.forEach(supplier => {
                    actions.push(new Promise((resolve, reject) => {
                        fn.demands.create(
                            supplier.supplier_id,
                            user_id,
                            [supplier]
                        )
                        .then(add_sizes_to_demand)
                        .then(resolve)
                        .catch(reject);
                    }));
                });
                Promise.allSettled(actions)
                .then(results => resolve(true))
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            fn.allowed(user_id, 'authorised_demander')
            .then(result => {
                sort_orders_by_supplier(orders)
                .then(demand_sizes)
                .then(result => resolve(true))
                .catch(reject);
            })
            .catch(reject);
        });
    };

    fn.orders.receive     = function (order_id, receipt, user_id, links = []) {
        function check_order(allowed) {
            return new Promise((resolve, reject) => {
                fn.orders.get({order_id: order_id})
                .then(order => {
                    if (!order.size) {
                        reject(new Error('Could not find size'));
    
                    } else if (![0, 1, 2, 3].includes(order.status)) {
                        reject(new Error('Unknown status'));
        
                    } else if (order.status === 0) {
                        reject(new Error('Order has already been cancelled'));
        
                    } else if (order.status === 3) {
                        reject(new Error('Order has already been received'));
        
                    } else {
                        resolve(order);
                    };
                })
                .catch(reject);
            });
        };
        function check_links(order) {
            return new Promise((resolve, reject) => {
                if (order.status === 1) {
                    resolve(order);
    
                } else if (links.findIndex(e => e.table === 'demand_lines') !== -1) {
                    resolve(order);
    
                } else {
                    reject(new Error('Order has been demanded. Receipt must be processed through the demand'));
                };
            });
        };
        function receive_order(order) {
            function receive_serials() {
                return new Promise((resolve, reject) => {
                    let actions = [];
                    receipt.serials.forEach(serial => {
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
                        const serials = results.filter(e => e.status === 'fulfilled');
                        const qty = serials.length;
                        if (qty && qty > 0) {
                            let links = [];
                            serials.forEach(serial => {
                                if (serial.location_id) {
                                    if (links.indexOf({_table: 'locations', id: serial.value.location_id}) === -1) {
                                        links.push({_table: 'locations', id: serial.value.location_id});
                                    };
                                };
                                links.push({_table: 'serials', id: serial.value.serial_id})
                            });
                            resolve([qty, links]);
        
                        } else {
                            reject(new Error('No successful receipts'));
        
                        };
                    })
                    .catch(reject);
                });
            };
            function receive_stock() {
                return new Promise((resolve, reject) => {
                    fn.stocks.receive({
                        qty:          receipt.qty,
                        user_id:      user_id,
                        action_links: [{_table: 'orders', id: order.order_id}],
                        stock: {
                            size_id: order.size_id,
                            location: receipt.location
                        },
                    })
                    .then(result => resolve([receipt.qty, []]))
                    .catch(reject);
                });
            };
            function check_variance(qty, links) {
                return new Promise((resolve, reject) => {
                    let qty_original = order.qty;
                    if (qty > qty_original) {
                        fn.update(
                            order,
                            {qty: qty},
                            [
                                `ORDER | Quantity increased from ${qty_original} to ${qty} on over receipt`,
                                user_id,
                                [{_table: 'orders', id: order.order_id}]
                            ]
                        )
                        .then(fn.actions.create)
                        .then(result => resolve([order, links, qty]))
                        .catch(reject);
                        
                    } else if (qty < qty_original) {
                        m.orders.create({
                            size_id: order.size_id,
                            qty:     qty,
                            status:  3,
                            user_id: user_id
                        })
                        .then(new_order => {
                            order.decrement('qty', {by: qty})
                            .then(result => {
                                if (result) {
                                    fn.actions.create([
                                        `ORDER | Quantity created by partial receipt`,
                                        user_id,
                                        [
                                            {_table: 'orders', id: order    .order_id},
                                            {_table: 'orders', id: new_order.order_id}
                                        ]
                                    ])
                                    .then(action => resolve([order, links, qty]));

                                } else {
                                    reject(new Error('Order quantity not decremented'));

                                };
                            })
                            .catch(reject);
                        })
                        .catch(reject);
                        
                    } else {
                        resolve([order, links, qty]);
                        
                    };
                });
            };
            return new Promise((resolve, reject) => {
                let action = null;
                if (order.size.has_serials) {
                    action = receive_serials;

                } else {
                    action = receive_stock;
                    
                };
                action(order)
                .then(check_variance)
                .then(resolve)
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            fn.allowed(user_id, 'stores_stock_admin')
            .then(check_order)
            .then(check_links)
            .then(receive_order)
            .then(([order, receive_links, qty]) => {
                update_order_status([
                    order,
                    3,
                    user_id,
                    'ORDER | RECEIVED',
                    links.concat(receive_links)
                ])
                .then(order => resolve(qty))
                .catch(reject);
            })
            .catch(reject);
        })
        .catch(reject);
    };
    
    function change_check(order_id) {
        return new Promise((resolve, reject) => {
            fn.orders.get({order_id: order_id})
            .then(order => {
                if (!order.size) {
                    reject(new Error('Error getting order size'));

                } else if (order.status === 1) {
                    resolve(order);

                } else {
                    reject(new Error('Only orders with a status of placed can have their quantity or size edited'));

                };
            })
            .catch(reject);
        });
    };
    fn.orders.change_size = function (order_id, size_id, user_id) {
        return new Promise((resolve, reject) => {
            change_check(order_id)
            .then(order => {
                fn.sizes.get({size_id: size_id})
                .then(size => {
                    if (size.item_id !== order.size.item_id) {
                        reject(new Error('New size is for a different item'));

                    } else {
                        const original_size = order.size;
                        fn.update(order, {size_id: size.size_id})
                        .then(result => {
                            fn.actions.create([
                                `ORDER | UPDATED | Size changed From: ${fn.print_size(original_size)} to: ${fn.print_size(size)}`,
                                user_id,
                                [{_table: 'orders', id: order.order_id}]
                            ])
                            .then(result => resolve(true));
                        })
                        .catch(reject);
                    };
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };
    fn.orders.change_qty  = function (order_id, qty, user_id) {
        return new Promise((resolve, reject) => {
            qty = Number(qty);
            if (!qty || !Number.isInteger(qty) || qty < 1) {
                reject(new Error('Invalid qty'));

            } else {
                change_check(order_id)
                .then(order => {
                    let original_qty = order.qty;
                    fn.update(order, {qty: qty})
                    .then(result => {
                        fn.actions.create([
                            `ORDER | UPDATED | Quantity changed From: ${original_qty} to: ${qty}`,
                            user_id,
                            [{_table: 'orders', id: order.order_id}]
                        ])
                        .then(result => resolve(true));
                    })
                    .catch(reject);
                })
                .catch(reject);
            };
        });
    };
};