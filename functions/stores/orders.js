const statuses = {0: 'cancelled', 1: 'placed', 2: 'demanded', 3: 'received'};
module.exports = function (m, fn) {
    fn.orders = {};
    fn.orders.get = function (order_id) {
        return new Promise((resolve, reject) => {
            m.orders.findOne({
                where: {order_id: order_id},
                include: [
                    fn.inc.stores.size({supplier: true}),
                    {
                        model: m.issues,
                        include: [fn.inc.users.user({as: 'user_issue'})]
                    }
                ]
            })
            .then(order => {
                if (order) {
                    resolve(order);

                } else {
                    reject(new Error('Order not found'));

                };
            })
            .catch(err => reject(err));
        });
    };
    
    function update_order_status(order, status, user_id, action, links = []) {
        return new Promise((resolve, reject) => {
            order.update({status: status})
            .then(result => {
                if (result) {
                    if (action) {
                        fn.actions.create(
                            action,
                            user_id,
                            [
                                {_table: 'orders', id: order.order_id}
                            ].concat(links)
                        )
                        .then(action => resolve(true));
    
                    } else {
                        resolve(true);
    
                    };

                } else {
                    reject(new Error('Order status not updated'));

                };
            })
            .catch(err => reject(err));
        });
    };
    
    function mark_check(order_id, status) {
        return new Promise((resolve, reject) => {
            if (status in statuses) {
                fn.orders.get(order_id)
                .then(order => {
                    if (order.status === Number(status)) {
                        reject(new Error('Status has not changed'));

                    } else {
                        resolve(order);

                    };
                })
                .catch(err => reject(err));

            } else {
                reject(new Error('Invalid status'));

            };
        });
    };
    fn.orders.mark_as = function (order_id, status, user_id) {
        return new Promise((resolve, reject) => {
            mark_check(order_id, status)
            .then(order => {
                const status_text = statuses[status];
                update_order_status(
                    order,
                    Number(status),
                    user_id,
                    `${status_text.toUpperCase()} | Set manually`
                )
                .then(result => resolve(`Order marked as ${status_text}`))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    function check_for_duplicate_lines(lines) {
        return new Promise(resolve => {
            let sizes = [];
            lines.forEach(line => {
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
    fn.orders.createBulk = function (orders, user_id) {
        return new Promise((resolve, reject) => {
            if (!orders || orders.length === 0) {
                reject(new Error('No orders'));

            } else {
                check_for_duplicate_lines(orders)
                .then(sizes => {
                    let order_actions = [];
                    sizes.forEach(size => {
                        order_actions.push(
                            fn.orders.create(size.size_id, size.qty, user_id)
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

    function create_or_increment_order(size_id, qty, user_id) {
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
                    .catch(err => reject(err));
    
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.orders.create     = function (size_id, qty, user_id, issues = []) {
        return new Promise((resolve, reject) => {
            fn.sizes.get({size_id: size_id})
            .then(size => {
                if (!size.orderable) {
                    reject(new Error('This size can not ordered'));

                } else {
                    create_or_increment_order(size.size_id, qty, user_id)
                    .then(order => {
                        let links = [];
                        issues.forEach(issue => {links.push({_table: 'issues', id: issue.issue_id})});
                        fn.actions.create(
                            'ORDER | CREATED',
                            user_id,
                            [{_table: 'orders', id: order.order_id}].concat(links)
                        )
                        .then(action => resolve(order));
                    })
                    .catch(err => reject(err));

                };
            })
            .catch(err => reject(err));
        });
    };

    function cancel_check(order_id) {
        return new Promise((resolve, reject) => {
            fn.orders.get(order_id)
            .then(order => {
                if (order.status === 0) {
                    reject(new Error('Order has already been cancelled'));

                } else if (order.status === 3) {
                    reject(new Error('Order has already been received'));

                } else if (order.status === 1 || order.status === 2) {
                    resolve(order);

                } else {
                    reject(new Error('Unknown order status'));

                };
            })
            .catch(err => reject(err));
        });
    };
    function cancel_update_issues(issues) {
        return new Promise((resolve, reject) => {
            let actions = [];
            issues.forEach(issue => {
                actions.push(new Promise((resolve, reject) => {
                    let record = {order_id: null};
                    if (issue.status === 3) record.status = 2;
                    
                    issue.update(record)
                    .then(result => {
                        if (result) {
                            resolve({_table: 'issues', id: issue.issue_id});

                        } else {
                            reject(new Error('Issue not updated'));

                        };
                    })
                    .catch(err => reject(err));
                }));
            });
            Promise.all(actions)
            .then(links => resolve(links))
            .catch(err => reject(err));
        });
    };
    fn.orders.cancel     = function (order_id, user_id) {
        return new Promise((resolve, reject) => {
            cancel_check(order_id)
            .then(order => {
                update_order_status(order, 0, user_id)
                .then(action => {
                    cancel_update_issues(order.issues)
                    .then(links => {
                        fn.actions.create(
                            'ORDER | CANCELLED',
                            user_id,
                            [{_table: 'orders', id: order.order_id}].concat(links)
                        )
                        .then(action => resolve(true));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    function restore_check(order_id) {
        return new Promise((resolve, reject) => {
            fn.orders.get(order_id)
            .then(order => {
                if (order.status !== 0) {
                    reject(new Error('Order is not cancelled'));

                } else {
                    resolve(order);

                };
            })
            .catch(err => reject(err));
        });
    };
    fn.orders.restore    = function (order_id, user_id) {
        return new Promise((resolve, reject) => {
            restore_check(order_id)
            .then(order => {
                update_order_status(order, 1, user_id)
                .then(action => {
                    fn.actions.create(
                        'ORDER | RESTORED',
                        user_id,
                        [{_table: 'orders', id: order.order_id}]
                    )
                    .then(action => resolve(true));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    function sort_orders_by_supplier(orders) {
        return new Promise((resolve, reject) => {
            let get_orders = [];
            orders.forEach(order => {
                get_orders.push(new Promise((resolve, reject) => {
                    fn.orders.get(order.order_id)
                    .then(order => {
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
                    })
                    .catch(err => reject(err));
                }));
            });
            Promise.allSettled(get_orders)
            .then(results => {
                let suppliers = [];
                results.forEach(result => {
                    if (result.status === 'fulfilled') {
                        let order = result.value;
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
                        
                    } else {
                        console.log(result.message);

                    };
                });
                resolve(suppliers);
            })
            .catch(err => reject(err));
        });
    };
    fn.orders.demand     = function (orders, user_id) {
        return new Promise((resolve, reject) => {
            fn.allowed(user_id, 'authorised_demander')
            .then(result => {
                sort_orders_by_supplier(orders)
                .then(suppliers => {
                    let demand_actions = [];
                    suppliers.forEach(supplier => {
                        demand_actions.push(new Promise((resolve, reject) => {
                            fn.demands.create(
                                supplier.supplier_id,
                                user_id
                            )
                            .then(demand_id => {
                                let line_actions = [];
                                supplier.sizes.forEach(size => {
                                    line_actions.push(new Promise((resolve, reject) => {
                                        fn.demands.lines.create(
                                            size.size_id,
                                            demand_id,
                                            user_id,
                                            size.orders
                                        )
                                        .then(demand_line_id => {
                                            let order_updates = [];
                                            size.orders.forEach(e => order_updates.push(update_order_status(e, 2, user_id)));
                                            Promise.all(order_updates)
                                            .then(results => resolve(demand_line_id))
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

    function receive_check(order_id) {
        return new Promise((resolve, reject) => {
            fn.orders.get(order_id)
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
            .catch(err => reject(err));
        });
    };
    function check_links(status, links) {
        return new Promise((resolve, reject) => {
            if (status === 1) {
                resolve(true);

            } else if (links.findIndex(e => e.table === 'demand_lines') !== -1) {
                resolve(true);

            } else {
                reject(new Error('Order has been demanded. Receipt must be processed through the demand'));
            };
        });
    };
    fn.orders.receive    = function (order_id, receipt, user_id, links = []) {
        return new Promise((resolve, reject) => {
            fn.allowed(user_id, 'stores_stock_admin')
            .then(allowed => {
                receive_check(order_id)
                .then(order => {
                    check_links(order.status, links)
                    .then(result => {
                        let action = null;
                        if (order.size.has_serials) {
                            action = receive_serials;

                        } else {
                            action = receive_stock;
                            
                        };
                        action(order, receipt, user_id)
                        .then(receive_result => {
                            receive_qty_variance(order, receive_result.qty, user_id)
                            .then(qty_result => {
                                update_order_status(
                                    qty_result.order,
                                    3,
                                    user_id,
                                    `ORDER | RECEIVED${qty_result.action || ''}`,
                                    links.concat(qty_result.links || []).concat(receive_result.links || [])
                                )
                                .then(result => resolve({order: qty_result.order, qty: receive_result.qty}))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function receive_serials(order, receipt, user_id) {
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
                let serials = results.filter(e => e.status === 'fulfilled');
                let qty = serials.length;
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
                    resolve({order: order, qty: qty, links: links});

                } else {
                    reject(new Error('No successful receipts'));

                };
            })
            .catch(err => reject(err));
        });
    };
    function receive_stock(order, receipt, user_id) {
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
            .then(result => resolve({order: order, qty: receipt.qty}))
            .catch(err => reject(err));
        });
    };
    function receive_qty_variance(order, qty, user_id) {
        return new Promise((resolve, reject) => {
            let qty_original = order.qty;
            if (qty > qty_original) {
                order.update({qty: qty})
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
                    order.decrement('qty', {by: qty})
                    .then(result => resolve({
                        action: ` | Partial receipt | New order created for receipt qty | Existing order qty updated from ${order.qty} to ${order.qty - qty}`,
                        links: [{_table: 'orders', id: new_order.order_id}],
                        order: new_order
                    }))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
                
            } else {
                resolve({order: order});
                
            };
        });
    };
    
    function change_check(order_id) {
        return new Promise((resolve, reject) => {
            fn.orders.get(order_id)
            .then(order => {
                if (!order.size) {
                    reject(new Error('Error getting order size'));

                } else if (order.status === 1) {
                    resolve(order);

                } else {
                    reject(new Error('Only orders with a status of placed can have their quantity or size edited'));

                };
            })
            .catch(err => reject(err));
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
                        order.update({size_id: size.size_id})
                        .then(result => {
                            if (result) {
                                fn.actions.create(
                                    `ORDER | UPDATED | Size changed From: ${fn.print_size(original_size)} to: ${fn.print_size(size)}`,
                                    user_id,
                                    [{_table: 'orders', id: order.order_id}]
                                )
                                .then(result => resolve(true));

                            } else {
                                reject(new Error('Order not updated'));

                            };
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.orders.change_qty = function (order_id, qty, user_id) {
        return new Promise((resolve, reject) => {
            qty = Number(qty);
            if (!qty || !Number.isInteger(qty) || qty < 1) {
                reject(new Error('Invalid qty'));

            } else {
                change_check(order_id)
                .then(order => {
                    let original_qty = order.qty;
                    order.update({qty: qty})
                    .then(result => {
                        if (result) {
                            fn.actions.create(
                                `ORDER | UPDATED | Quantity changed From: ${original_qty} to: ${qty}`,
                                user_id,
                                [{_table: 'orders', id: order.order_id}]
                            )
                            .then(result => resolve(true));

                        } else {
                            reject(new Error('Issue not updated'));

                        };
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            };
        });
    };
};