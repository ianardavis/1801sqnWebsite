module.exports = function (m, fn) {
    const line_status = {0: "Cancelled", 1: "Pending", 2: "Open", 3: "Closed"};
    function createLineAction(action, line_id, user_id, links = []) {
        return new Promise(resolve => {
            fn.actions.create([
                `DEMAND LINE | ${action}`,
                user_id,
                [{_table: 'demand_lines', id: line_id}].concat(links)
            ])
            .then(action => resolve(true))
            .catch(err => {
                console.error(err);
                resolve(false)
            });
        });
    };
    fn.demands.lines.count = function (where) { return m.demand_lines.count({where: where})};
    fn.demands.lines.sum = function (where) { return m.demand_lines.sum('qty', {where: where})};
    fn.demands.lines.find = function (where, include = []) {
        return fn.find(
            m.demand_lines,
            where,
            [
                fn.inc.stores.demand(), 
                fn.inc.stores.size()
            ].concat(include)
        );
    };
    fn.demands.lines.findAndCountAll = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.demand_lines.findAndCountAll({
                where: where,
                include: [
                    fn.inc.stores.size(),
                    fn.inc.users.user(),
                    fn.inc.stores.demand(),
                    fn.inc.stores.orders()
                ],
                ...pagination
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
    fn.demands.lines.findAll = function (where = {}, include = [], options = {}) {
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
                    resolve(lines);

                } else {
                    reject(new Error('No lines found'));

                };
            })
            .catch(reject);
        });
    };

    fn.demands.lines.create = function (size_id, demand_id, user_id, orders = []) {
        function checkSize(size_id) {
            return new Promise((resolve, reject) => {
                fn.sizes.find(
                    {size_id: size_id},
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
                .catch(reject);
            });
        };
        function checkDemand(size) {
            return new Promise((resolve, reject) => {
                fn.demands.find({demand_id: demand_id})
                .then(demand => {
                    if (demand.status !== 1) {
                        reject(new Error('Lines can only be added to draft demands'));
    
                    } else if (size.supplier_id !== demand.supplier_id) {
                        reject(new Error('Size and demand are not for the same supplier'));
    
                    } else {
                        resolve([demand.demand_id, size.size_id]);
    
                    };
                })
                .catch(reject);
            });
        };
        function createLine([demand_id, size_id]) {
            return new Promise((resolve, reject) => {
                m.demand_lines.findOrCreate({
                    where: {
                        demand_id: demand_id,
                        size_id:   size_id
                    },
                    defaults: {
                        user_id: user_id
                    }
                })
                .then(([line, created]) => {
                    let actions = [];
                    orders.forEach(order => {
                        actions.push(m.order_demand_lines.create({
                            order_id: order.order_id,
                            line_id:  line.line_id
                        }));
                    });
                    Promise.all(actions)
                    .then(results => {
                        let links = [];
                        orders.forEach(e => links.push({_table: 'orders', id: e.order_id}));
                        resolve([
                            `DEMAND LINE | ${(created ? 'CREATED' : 'INCREMENTED')}`,
                            user_id,
                            [{_table: 'demand_lines', id: line.line_id}].concat(links)
                            [line.line_id, created],
                            line.line_id
                        ]);
                    })
                    .catch(reject);
                })
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            checkSize(size_id, demand_id, user_id, orders)
            .then(checkDemand)
            .then(createLine)
            .then(fn.actions.create)
            .then(line_id => resolve(line_id))
            .catch(reject);
        });
    };
    fn.demands.lines.createBulk = function (lines, demand_id, user_id) {
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
                .catch(reject);

            };
        });
    };

    fn.demands.lines.update = function (lines, user_id) {
        return new Promise((resolve, reject) => {
            if (!lines || lines.length === 0) {
                fn.sendError(res, 'No lines submitted');
    
            } else {
                let actions = [];
                lines.filter(e => e.status === '0').forEach(line => {
                    actions.push(
                        fn.demands.lines.cancel(line.line_id, user_id)
                    );
                });
                // lines.filter(e => e.status === '-1').forEach(line => {
                //     actions.push(
                //         fn.demands.lines.restore(line.line_id, user_id)
                //     );
                // });
                lines.filter(e => e.status === '3').forEach(line => {
                    actions.push(
                        fn.demands.lines.receive(line, user_id)
                    );
                });
                Promise.all(actions)
                .then(results => resolve(true))
                .catch(reject);
                
            };
        });
    };
    
    fn.demands.lines.cancel = function (line_id, user_id) {
        function check(line_id, user_id) {
            return new Promise((resolve, reject) => {
                fn.demands.lines.find(
                    {line_id: line_id},
                    [m.orders]
                )
                .then(line => {
                    //Check it is Pending or Open
                    if (line.status !== 1 && line.status !== 2) {
                        reject(new Error(`This line is ${line_status[line.status]}, only pending or open lines can be cancelled`));
    
                    } else {
                        resolve(line, user_id);
    
                    };
                })
                .catch(reject);
            });
        };
        function updateLine(line, user_id) {
            return new Promise((resolve, reject) => {
                fn.update(line, {status: 0})
                .then(result => resolve(line, user_id))
                .catch(reject);
            });
        };
        function updateOrders(line, user_id) {
            return new Promise((resolve, reject) => {
                let order_actions = [];
                line.orders.forEach(order => {
                    //For each order, if its status is demanded, change to Placed and return order id
                    order_actions.push(new Promise((resolve, reject) => {
                        if (order.status === 3) {
                            fn.update(order, {status: 2})
                            .then(result => resolve(order.order_id))
                            .catch(reject);
    
                        } else {
                            reject(new Error(`Non-allowed order status: ${order.status}`));
    
                        };
                    }));
                });
                Promise.allSettled(order_actions)
                .then(results => {
                    let links = [];
                    //get an array of all the orders updated
                    results.forEach(e => links.push({_table: 'orders', id: e.value}));
                    resolve([
                        'DEMAND LINE | CANCELLED',
                        user_id,
                        [{_table: 'demand_lines', id: line.line_id}].concat(links)
                    ]);
                })
                .catch(reject);
            });
        };
        return new Promise ((resolve, reject) => {
            check(line_id, user_id)
            .then(updateLine)
            .then(updateOrders)
            .then(fn.actions.create)
            .then(result => resolve(true))
            .catch(reject);
        });
    };

    fn.demands.lines.receive = function (line, user_id) {
        function check(details, user_id) {
            return new Promise((resolve, reject) => {
                fn.demands.lines.find(
                    {line_id: details.line_id},
                    [{
                        model: m.orders,
                        where: {status: 2}
                    }]
                )
                .then(demand_line => {
                    if (!demand_line.size) {
                        reject(new Error('Size not found'));
    
                    } else {
                        resolve(demand_line, details, user_id);
    
                    };
                })
                .catch(reject);
            });
        };
        function receiveOrders(line, details, user_id) {
            function receiveSerials(line, details, user_id) {
                return new Promise((resolve, reject) => {
                    let actions = [];
                    let serials = details.serials
                    for (let i = 0; (i < line.orders.length) && (serials.length > 0); i++) {
                        let order   = line.orders[i];
                        let receipt = {serials: []};
                        let qty = Math.min(order.qty, serials.length);
                        for (let i = 0; i < qty; i++) {
                            receipt.serials.push(serials.pop());
                        };
                        actions.push(
                            fn.orders.receive(
                                order.order_id,
                                receipt,
                                user_id,
                                [{_table: 'demand_lines', id: line.line_id}]
                            )
                        );
                    };
                    Promise.allSettled(actions)
                    .then(fn.logRejects)
                    .then(results => resolve([results, serials]))
                    .catch(reject);
                });
            };
            function receiveStock(line, details, user_id) {
                return new Promise((resolve, reject) => {
                    let qty_left = details.qty || 0;
                    let actions = []
                    for (let i = 0; (i < line.orders.length) && (qty_left > 0); i++) {
                        let order = line.orders[i];
                        let receipt = {};
                        if (qty_left === 0) break;
                        receipt.location = details.location;
                        if (qty_left >= details.qty) {
                            receipt.qty = order.qty;
        
                        } else {
                            receipt.qty = qty_left;
        
                        };
                        qty_left -= receipt.qty;
                        actions.push(
                            fn.orders.receive(
                                order.order_id,
                                receipt,
                                user_id,
                                [{_table: 'demand_lines', id: line.line_id}]
                            )
                        );
                    };
                    Promise.allSettled(actions)
                    .then(fn.logRejects)
                    .then(results => resolve([results, qty_left]))
                    .catch(reject);
                });
            };
            return new Promise((resolve, reject) => {
                const has_serials = (line.size.has_serials);
                let action = null;
                if (has_serials) {
                    action = receiveSerials;
    
                } else {
                    action = receiveStock;
    
                };
                action(line, details, user_id)
                .then(([results, remaining]) => {
                    let qty_received = 0;
                    results.filter(e => e.status === 'fulfilled').forEach(e => qty_received += Number(e.value));
                    resolve({
                        demand_line: line,
                        qty:         qty_received,
                        remaining:   (has_serials ? remaining : {qty: remaining, location: details.location})
                    });
                })
                .catch(reject);
            });
        };
        function receiveRemaining(order_qty, size_id, line_id, user_id, receipt) {
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
                            [{_table: 'demand_lines', id: line_id}]
                        )
                        .then(resolve)
                        .catch(reject);
                    })
                    .catch(reject);
    
                } else {
                    resolve(0);
    
                };
            });
        };
        function checkReceiptVariance(demand_line, qty, user_id) {
            return new Promise((resolve, reject) => {
                let qty_original = demand_line.qty;
                if (qty > qty_original) {
                    fn.update(demand_line, {qty: qty})
                    .then(result => {
                        createLineAction(
                            `UPDATED | Qty increased from ${qty_original} to ${qty} on receipt`,
                            demand_line.line_id,
                            user_id
                        )
                        .then(action => resolve({demand_line: demand_line}));
                    })
                    .catch(reject);

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
                            createLineAction(
                                `UPDATED | Partial receipt | New demand line created for receipt qty | Existing demand line qty updated from ${qty_original} to ${qty_original - qty}`,
                                demand_line.line_id,
                                user_id,
                                [{_table: 'demand_lines', id: new_line.line_id}]
                            )
                            .then(action => resolve({demand_line: new_line}));
                        })
                        .catch(reject);
                    })
                    .catch(reject);

                } else {
                    resolve({demand_line: demand_line});
                    
                };
            });
        };
        // 
        return new Promise((resolve, reject) => {
            check(line, user_id)
            .then(receiveOrders)
            .then(result => {
                let order_qty = 0, receipt = {};
                if (result.demand_line.size.has_serials) {
                    order_qty       = result.remaining.length;
                    receipt.serials = result.remaining;
                    
                } else {
                    order_qty        = result.remaining.qty;
                    receipt.qty      = result.remaining.qty;
                    receipt.location = line.location;
                    
                };
                receiveRemaining(
                    order_qty,
                    result.demand_line.size_id,
                    result.demand_line.line_id,
                    user_id,
                    receipt
                )
                .then(received => {
                    checkReceiptVariance(result.demand_line, Number(result.qty) + Number(received), user_id)
                    .then(variance_result => {
                        fn.update(variance_result.demand_line, {status: 3})
                        .then(result => resolve(true))
                        .catch(reject);
                    })
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };
};