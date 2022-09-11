module.exports = function (m, fn) {
    const line_status = {0: "Cancelled", 1: "Pending", 2: "Open", 3: "Closed"};
    function create_line_action(action, line_id, user_id, links = []) {
        return new Promise(resolve => {
            fn.actions.create(
                `DEMAND LINE | ${action}`,
                user_id,
                [{table: 'demand_lines', id: line_id}].concat(links)
            )
            .then(action => resolve(demand.demand_id));
        });
    };
    fn.demands.lines.get     = function (where, includes = [], allowNull = false) {
        return new Promise((resolve, reject) => {
            m.demand_lines.findOne({
                where: where,
                include: [m.demands, m.sizes].concat(includes)
            })
            .then(line => {
                if (line || allowNull) {
                    resolve(line);
                } else {
                    reject(new Error('Line not found'));
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.demands.lines.getAll  = function (where = {}, include = [], options = {}) {
        return new Promise((resolve, reject) => {
            m.demand_lines.findAll({
                where:   where,
                include: include
            })
            .then(lines => {
                if (
                    options.allowNull === true ||
                    (lines && lines.length > 0)
                ) {
                    resolve(lines)
                } else {
                    reject(new Error('No lines found'));
                };
            })
            .catch(err => reject(err));
        });
    };

    function check_for_demand_details(size_id) {
        return new Promise((resolve, reject) => {
            fn.sizes.get(
                size_id,
                [fn.inc.stores.details({
                    where: {name: {[fn.op.or]:['Demand Page', 'Demand Cell']}}
                })]
            )
            .then(size => {
                if (!size.details) {
                    reject(new Error('No demand page/cell for this size'));
                } else if (!size.details.filter(e => e.name === 'Demand Page')) {
                    reject(new Error('No demand page for this size'));
                } else if (!size.details.filter(e => e.name === 'Demand Cell')) {
                    reject(new Error('No demand cell for this size'));
                } else {
                    resolve(size);
                };
            })
            .catch(err => reject(err));
        });
    };
    function check_demand(demand_id, size) {
        return new Promise((resolve, reject) => {
            fn.demands.get({demand_id: demand_id})
            .then(demand => {
                if (demand.status !== 1) {
                    reject(new Error('Lines can only be added to draft demands'));
                } else if (size.supplier_id !== demand.supplier_id) {
                    reject(new Error('Size and demand are not for the same supplier'));
                } else {
                    resolve(demand);
                };
            })
            .catch(err => reject(err));
        });
    };
    function create_line(demand_id, size_id, qty, user_id) {
        return new Promise((resolve, reject) => {
            m.demand_lines.findOrCreate({
                where: {
                    demand_id: demand_id,
                    size_id:   size_id
                },
                defaults: {
                    qty:     qty,
                    user_id: user_id
                }
            })
            .then(([line, created]) => {
                if (created) {
                    resolve(line.demand_line_id);
                } else {
                    line.increment('qty', {by: qty})
                    .then(result => {
                        if (result) {
                            resolve(line.demand_line_id);
                        } else {
                            reject(new Error('Line not incremented'));
                        };
                    });
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.demands.lines.create  = function (size_id, demand_id, qty, user_id, orders = []) {
        return new Promise((resolve, reject) => {
            check_for_demand_details(size_id)
            .then(size => {
                check_demand(demand_id, size)
                .then(demand => {
                    create_line(
                        demand.demand_id,
                        size.size_id,
                        qty,
                        user_id
                    )
                    .then(line_id => {
                        let links = [];
                        orders.forEach(e => links.push({table: 'orders', id: e.order_id}));
                        create_line_action(
                            `${(created ? 'CREATED' : `INCREMENTED | By ${qty}`)}`,
                            line_id,
                            user_id,
                            links
                        )
                        .then(result => resolve(line.demand_line_id));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.demands.lines.create_bulk = function (lines, demand_id, user_id) {
        return new Promise((resolve, reject) => {
            if (!lines || lines.length === 0) {
                reject(new Error('No lines'));
            } else {
                let actions = [];
                lines.forEach(line => {
                    actions.push(
                        fn.demands.lines.create(
                            line.size_id,
                            demand_id,
                            line.qty,
                            user_id
                        )
                    );
                });
                Promise.all(actions)
                .then(result => resolve(true))
                .catch(err => reject(err));
            };
        });
    };

    function get_orders_for_demand_line(demand_line_id, options = {}) {
        return new Promise((resolve, reject) => {
            m.action_links.findAll({
                where: {
                    _table: 'demand_lines',
                    id:     demand_line_id,
                    ...(options.active_only ? {active: true}: {})
                },
                include: [{
                    model: m.actions,
                    where: {
                        action: {[fn.op.or]:[
                            'DEMAND LINE | CREATED',
                            {[fn.op.startsWith]: 'DEMAND LINE | INCREMENTED'}
                        ]}
                    },
                    include: [{
                        model: m.action_links,
                        as: 'links',
                        where: {
                            _table: 'orders',
                            ...(options.active_only ? {active: true}: {})
                        }
                    }]
                }]
            })
            .then(links => {
                if (links) {
                    let order_actions = [];
                    links.forEach(_link => {
                        _link.action.links.forEach(link => {
                            order_actions.push(new Promise(resolve => {
                                m.orders.findOne({where: {order_id: link.id}})
                                .then(order => resolve((options.id_only ? order.order_id : order)))
                                .catch(err => {
                                    console.log(err);
                                    resolve((options.id_only ? '' : {}));
                                });
                            }));
                        });
                    });
                    return Promise.all(order_actions)
                    .then(orders => resolve({links: links, orders: orders}))
                    .catch(err => reject(err));
                } else {
                    resolve({links: [], orders: []});
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.demands.lines.cancel  = function (demand_line_id, user_id) {
        return new Promise ((resolve, reject) => {
            //Get the line to be cancelled
            fn.demands.lines.get({demand_line_id: demand_line_id})
            .then(line => {
                //Check it is Pending or Open
                if (line.status !== 1 && line.status !== 2) {
                    reject(new Error(`This line is ${line_status[line.status]}, only pending or open lines can be cancelled`));
                } else {
                    //Set the lines status to cancelled
                    line.update({status: 0})
                    .then(result => {
                        if (result) {
                            //Get the order for this demand
                            get_orders_for_demand_line(line.demand_line_id, {active_only: true})
                            .then(result => {
                                let order_actions = [];
                                result.orders.forEach(order => {
                                    //For each order, if its status is demanded, change to Placed and return order id
                                    order_actions.push(new Promise((resolve, reject) => {
                                        if (order.status === 3) {
                                            order.update({status: 2})
                                            .then(result => resolve(order.order_id))
                                            .catch(err => reject(err));
                                        } else {
                                            reject(new Error(`Non-allowed order status: ${order.status}`));
                                        };
                                    }));
                                });
                                Promise.allSettled(order_actions)
                                .then(results => {
                                    //Change the demand line link to non active
                                    let link_actions = [];
                                    result.links.forEach(e => link_actions.push(fn.update(e, {active: false})))
                                    Promise.allSettled(actions)
                                    .then(result => {
                                        let order_links = [];
                                        //get an array of all the orders updated
                                        results.forEach(e => order_links.push({table: 'orders', id: e.value}));
                                        //create the canclled action record
                                        create_line_action(
                                            'CANCELLED',
                                            line.demand_line_id,
                                            user_id,
                                            order_links
                                        )
                                        .then(result => resolve(true));
                                    })
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        } else {
                            reject(new Error('Line not updated'));
                        };
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };

    fn.demands.lines.receive = function (line, user_id) {
        return new Promise((resolve, reject) => {
            fn.demands.lines.get({demand_line_id: line.demand_line_id})
            .then(demand_line => {
                if (!demand_line.size) {
                    reject(new Error('Size not found'));
                } else {
                    get_orders_for_demand_line(demand_line.demand_line_id, {active_only: true})
                    .then(result => {
                        receive_orders(
                            demand_line.demand_line_id,
                            demand_line.size.has_serials,
                            user_id,
                            result.orders,
                            line
                        )
                        .then(result => {
                            let order_qty = 0, receipt = {};
                            if (demand_line.size.has_serials) {
                                order_qty       = result.remaining.length;
                                receipt.serials = result.remaining;
                            } else {
                                order_qty        = result.remaining.qty;
                                receipt.qty      = result.remaining.qty;
                                receipt.location = line.location;
                            };
                            receive_remaining(
                                order_qty,
                                demand_line.size_id,
                                demand_line.demand_line_id,
                                user_id,
                                receipt
                            )
                            .then(received => {
                                check_receipt_variance(demand_line, Number(result.qty) + Number(received), user_id)
                                .then(variance_result => {
                                    variance_result.demand_line.update({status: 3})
                                    .then(result => {
                                        if (result) {
                                            fn.allSettledResults(results);
                                            resolve(true);
                                        } else {
                                            reject(new Error('Line not updated'));
                                        };
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
                };
            })
            .catch(err => reject(err));
        });
    };
    function receive_orders(demand_line_id, has_serials, user_id, orders, line) {
        return new Promise((resolve, reject) => {
            let receipt_actions = [],
                serials  = line.serials || [],
                qty_left = line.qty     || 0;
            if (has_serials) {
                for (let i = 0; (i < orders.length) && (serials.length > 0); i++) {
                    let order   = orders[i],
                        receipt = {serials: []};
                    let qty = Math.min(order.qty, serials.length);
                    for (let i = 0; i < qty; i++) {
                        receipt.serials.push(serials.pop());
                    };
                    receipt_actions.push(
                        fn.orders.receive(
                            order.order_id,
                            receipt,
                            user_id,
                            [{table: 'demand_lines', id: demand_line_id}]
                        )
                    );
                };
            } else {
                for (let i = 0; (i < orders.length) && (qty_left > 0); i++) {
                    let order   = orders[i],
                        receipt = {};
                    if (qty_left === 0) break;
                    receipt.location = line.location;
                    if (qty_left >= line.qty) {
                        receipt.qty = order.qty
                    } else {
                        receipt.qty = qty_left;
                    };
                    qty_left -= receipt.qty;
                    receipt_actions.push(
                        fn.orders.receive(
                            order.order_id,
                            receipt,
                            user_id,
                            [{table: 'demand_lines', id: demand_line_id}]
                        )
                    );
                };
            };
            Promise.allSettled(receipt_actions)
            .then(results => {
                fn.allSettledResults(results)
                let qty_received = 0;
                results.filter(e => e.status === 'fulfilled').forEach(e => qty_received += Number(e.value.qty));
                resolve({qty: qty_received, remaining: (has_serials ? serials : {qty: qty_left, location: line.location})});
            })
            .catch(err => reject(err));
        });
    };
    function receive_remaining(order_qty, size_id, demand_line_id, user_id, receipt) {
        return new Promise((resolve, reject) => {
            if (order_qty > 0) {
                fn.orders.create(
                    size_id,
                    order_qty,
                    user_id,
                )
                .then(order => {
                    fn.orders.receive(
                        order.order_id,
                        receipt,
                        user_id,
                        [{table: 'demand_lines', id: demand_line_id}]
                    )
                    .then(result => resolve(result.qty))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            } else {
                resolve(0);
            };
        });
    };
    function check_receipt_variance(demand_line, qty, user_id) {
        return new Promise((resolve, reject) => {
            let qty_original = demand_line.qty;
            if (qty > qty_original) {
                demand_line.update({qty: qty})
                .then(result => {
                    if (result) {
                        create_line_action(
                            `UPDATED | Qty increased from ${qty_original} to ${qty} on receipt`,
                            demand_line.demand_line_id,
                            user_id
                        )
                        .then(action => resolve({demand_line: demand_line}));
                    } else {
                        reject(new Error('Line not updated'));
                    };
                })
                .catch(err => reject(err));
            } else if (qty < qty_original) {
                m.demand_lines.create({
                    demand_id: demand_line.demand_id,
                    size_id:   demand_line.size_id,
                    qty:       qty,
                    status:    3,
                    user_id:   user_id
                })
                .then(new_line => {
                    demand_line.decrement('qty', {by: qty})
                    .then(result => {
                        create_line_action(
                            `UPDATED | Partial receipt | New demand line created for receipt qty | Existing demand line qty updated from ${qty_original} to ${qty_original - qty}`,
                            demand_line.demand_line_id,
                            user_id,
                            [{table: 'demand_lines', id: new_line.demand_line_id}]
                        )
                        .then(action => resolve({demand_line: new_line}));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            } else {
                resolve({demand_line: demand_line});
            };
        });
    };
};