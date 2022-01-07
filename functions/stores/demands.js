module.exports = function (m, fn) {
    let line_status = {0: "Cancelled", 1: "Pending", 2: "Open", 3: "Closed"};
    fn.demands = {lines: {}};
    fn.demands.get = function (demand_id) {
        return fn.get('demands', {demand_id: demand_id});
    };
    fn.demands.create   = function (options = {}) {
        return new Promise((resolve, reject) => {
            fn.suppliers.get(options.supplier_id)
            .then(supplier => {
                m.demands.findOrCreate({
                    where: {
                        supplier_id: supplier.supplier_id,
                        status:     1
                    },
                    defaults: {user_id: options.user_id}
                })
                .then(([demand, created]) => {
                    if (created) {
                        fn.actions.create(
                            'DEMAND | CREATED',
                            options.user_id,
                            [{table: 'demands', id: demand.demand_id}]
                        )
                        .then(action => resolve(demand.demand_id))
                        .catch(err => {
                            console.log(err);
                            resolve(demand.demand_id);
                        });
                    } else resolve(demand.demand_id);
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.demands.complete = function (demand_id, user) {
        return new Promise((resolve, reject) => {
            fn.demands.get(demand_id)
            .then(demand => {
                if  (demand.status !== 1) reject(new Error('This demand is not in draft'))
                else {
                    getDemandLines({
                        demand_id: demand.demand_id,
                        status: 1
                    })
                    .then(lines => {
                        fn.update(demand, { status: 2})
                        .then(result => {
                            let actions = [];
                            lines.forEach(line => actions.push(fn.update(line, {status: 2})))
                            Promise.all(actions)
                            .then(result => {
                                fn.actions.create(
                                    'DEMAND | COMPLETED',
                                    user.user_id,
                                    [{table: 'demands', id: demand.demand_id}]
                                )
                                .then(action => {
                                    fn.demands.raise(demand.demand_id, user)
                                    .then(filename => resolve({success: true, message: `Demand completed. Filename: ${filename}`}))
                                    .catch(err => {
                                        console.log(err);
                                        resolve({success: true, message: `Demand completed. Could not raise file: ${err.message}`})
                                    });
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
    fn.demands.cancel   = function (demand_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.demands.get(demand_id)
            .then(demand => {
                if ([0, 3].includes(demand.status)) reject(new Error(`This demand has already been ${(demand.status === 0 ? 'cancelled' : 'closed')}`))
                else {
                    m.demand_lines.findOne({
                        where: {
                            demand_id: demand.demand_id,
                            status:    3
                        }
                    })
                    .then(line => {
                        if (line) reject(new Error('You can not cancel a demand with received lines'))
                        else {
                            Promise.all([
                                fn.update(demand, {status: 0}),
                                cancel_open_demand_lines(demand.demand_id, user_id)
                            ])
                            .then(result => {
                                if (!result) reject(new Error('Demand not updated'))
                                else {
                                    fn.actions.create(
                                        'DEMAND | CANCELLED',
                                        user_id,
                                        [{table: 'demands', id: demand.demand_id}]
                                    )
                                    .then(action => resolve(true))
                                    .catch(err => {
                                        console.log(err);
                                        resolve(new Error(`Demand cancelled. Error creating action: ${err.message}`))
                                    });
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
    function cancel_open_demand_lines(demand_id, user_id) {
        return new Promise((resolve, reject) => {
            m.demand_lines.findAll({
                where: {
                    demand_id: demand_id,
                    status: {[fn.op.or]: [1, 2]}
                }
            })
            .then(lines => {
                let line_actions = [];
                lines.forEach(line => {
                    line_actions.push(
                        fn.demands.lines.cancel(
                            line.demand_line_id,
                            user_id
                        )
                    );
                });
                Promise.all(line_actions)
                .then(results => resolve(true))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        })
    };
    fn.demands.raise    = function (demand_id, user) {
        return new Promise((resolve, reject) => {
            fn.demands.get(demand_id)
            .then(demand => {
                if      (demand.status !== 2)                       reject(new Error('This demand is not complete'))
                else if (demand.filename && demand.filename !== '') resolve(demand.filename)
                else {
                    get_template(demand.supplier_id)
                    .then(([template, account, supplier_id]) => {
                        getDemandLines(
                            {
                                demand_id: demand.demand_id,
                                status: 2
                            },
                            [fn.inc.stores.size({details: true})]
                        )
                        .then(demand_lines => {
                            get_orders_for_demand_lines(demand_lines)
                            .then(order_ids => {
                                get_sizes(demand_lines, supplier_id)
                                .then(sizes => {
                                    get_users(order_ids)
                                    .then(users => {
                                        create_file(template.filename, demand.demand_id)
                                        .then(file => {
                                            write_cover_sheet(template, account, file, users, user)
                                            .then(result => {
                                                write_items(file, sizes)
                                                .then(fails => {
                                                    fn.update(demand, {filename: file})
                                                    .then(result => resolve(file))
                                                    .catch(err => resolve(file));
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
    fn.demands.close    = function (demand_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.demands.get(demand_id)
            .then(demand => {
                if (demand.status !== 2) reject(new Error('This demand is not complete'))
                else {
                    getDemandLines(
                        {
                            demand_id: demand_id,
                            status: {[fn.op.or]: [1, 2]}
                        },
                        [],
                        {allowNull: true}
                    )
                    .then(lines => {
                        if (lines && lines.length > 0) reject(new Error('This demand has pending or open lines'))
                        else {
                            fn.update(demand, {status: 3})
                            .then(result => {
                                fn.actions.create(
                                    'DEMAND | CLOSED',
                                    user_id,
                                    [{table: 'demands', id: demand.demand_id}]
                                )
                                .then(action => resolve(true))
                                .catch(err => {
                                    console.log(err);
                                    resolve({success: true, message: `Demand closed. Error creating action: ${err.message}`});
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
    
    fn.demands.lines.get     = function (demand_line_id) {
        return fn.get(
            'demand_lines',
            {demand_line_id: demand_line_id},
            [m.demands, m.sizes]
        );
    };
    fn.demands.lines.create  = function (options = {}) {
        return new Promise((resolve, reject) => {
            fn.get(
                'sizes',
                {size_id: options.size_id},
                [fn.inc.stores.details({
                    where: {name: {[fn.op.or]:['Demand Page', 'Demand Cell']}}
                })]
            )
            .then(size => {
                if      (!size.details)                                       reject(new Error('No demand page/cell for this size'))
                else if (!size.details.filter(e => e.name === 'Demand Page')) reject(new Error('No demand page for this size'))
                else if (!size.details.filter(e => e.name === 'Demand Cell')) reject(new Error('No demand cell for this size'))
                else {
                    fn.demands.get(options.demand_id)
                    .then(demand => {
                        if      (demand.status    !== 1)                  reject(new Error('Lines can only be added to draft demands'))
                        else if (size.supplier_id !== demand.supplier_id) reject(new Error('Size is not from this supplier'))
                        else {
                            m.demand_lines.findOrCreate({
                                where: {
                                    demand_id: demand.demand_id,
                                    size_id:   size.size_id
                                },
                                defaults: {
                                    qty:     options.qty,
                                    user_id: options.user_id
                                }
                            })
                            .then(([line, created]) => {
                                let action = null;
                                if (created) action = new Promise(r => r(true))
                                else action = fn.increment(line, options.qty)
                                action
                                .then(result => {
                                    let links = [];
                                    options.orders.forEach(e => links.push({table: 'orders', id: e.order_id}));
                                    fn.actions.create(
                                        `DEMAND LINE | ${(created ? 'CREATED' : `INCREMENTED | By ${options.qty}`)}`,
                                        options.user_id,
                                        [{table: 'demand_lines', id: line.demand_line_id}].concat(links)
                                    )
                                    .then(action => resolve(line.demand_line_id))
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
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
    fn.demands.lines.receive = function (line, user_id) {
        return new Promise((resolve, reject) => {
            fn.demands.lines.get(line.demand_line_id)
            .then(demand_line => {
                if (!demand_line.size) reject(new Error('Size not found'))
                else {
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
                                    fn.update(variance_result.demand_line, {status: 3})
                                    .then(result => {
                                        fn.allSettledResults(results);
                                        resolve(true);
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
                    if (qty_left >= line.qty) receipt.qty = order.qty
                    else                      receipt.qty = qty_left;
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
            } else resolve(0);
        });
    };
    function check_receipt_variance(demand_line, qty, user_id) {
        return new Promise((resolve, reject) => {
            let qty_original = demand_line.qty;
            if (qty > qty_original) {
                fn.update(demand_line, {qty: qty})
                .then(result => {
                    fn.actions.create(
                        `DEMAND LINE | UPDATED | Qty increased from ${qty_original} to ${qty} on receipt`,
                        user_id,
                        [{table: 'demand_lines', id: demand_line.demand_line_id}]
                    )
                    .then(action => resolve({demand_line: demand_line}))
                    .catch(err => {
                        console.log(err);
                        resolve({demand_line: demand_line})
                    });
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
                    fn.decrement(demand_line, qty)
                    .then(result => {
                        fn.actions.create(
                            `DEMAND LINE | UPDATED | Partial receipt | New demand line created for receipt qty | Existing demand line qty updated from ${qty_original} to ${qty_original - qty}`,
                            user_id,
                            [
                                {table: 'demand_lines', id: demand_line.demand_line_id},
                                {table: 'demand_lines', id: new_line.demand_line_id}
                            ]
                        )
                        .then(action => resolve({demand_line: new_line}))
                        .catch(err => {
                            console.log(err);
                            resolve({demand_line: new_line})
                        });
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            } else resolve({demand_line: demand_line});
        });
    };
    
    // fn.demands.lines.restore = function (demand_line_id, user_id) {
    //     return new Promise((resolve, reject) => {
    //         fn.demands.lines.get(demand_line_id)
    //         .then(line => {
    //             if      (line.status !== 0)        reject(new Error('Line is not currently cancelled'))
    //             else if (line.demand.status !== 1) reject(new Error('Only lines on draft demands can be restored'))
    //             else {
    //                 fn.update(line, {status: 1})
    //                 .then(result => {
    //                     //Set the lines status to Pending
    //                     fn.update(line, {status: 1})
    //                     .then(result => {
    //                         //Get the order for this demand
    //                         get_orders_for_demand_line(line.demand_line_id)
    //                         .then(result => {
    //                             let order_actions = [];
    //                             result.orders.forEach(order => {
    //                                 //For each order, if its status is Placed, change to Demanded and return order id
    //                                 order_actions.push(new Promise((resolve, reject) => {
    //                                     if (order.status === 2) {
    //                                         fn.update(order, {status: 3})
    //                                         .then(result => resolve(order.order_id))
    //                                         .catch(err => reject(err));
    //                                     } else reject(new Error(`Non-allowed order status: ${order.status}`));
    //                                 }));
    //                             });
    //                             Promise.allSettled(order_actions)
    //                             .then(results => {
    //                                 //Change the demand line link to non active
    //                                 fn.update(result.link, {active: true})
    //                                 .then(result => {
    //                                     let order_links = [];
    //                                     //get an array of all the orders updated
    //                                     results.forEach(e => order_links.push({table: 'orders', id: e.value}));
    //                                     //create the canclled action record
    //                                     fn.actions.create(
    //                                         'DEMAND LINE | RESTORED',
    //                                         user_id,
    //                                         [{table: 'demand_lines', id: line.demand_line_id}].concat(order_links)
    //                                     )
    //                                     .then(result => resolve(true))
    //                                     .catch(err => {
    //                                         console.log(err);
    //                                         resolve(false);
    //                                     });
    //                                 })
    //                                 .catch(err => reject(err));
    //                             })
    //                             .catch(err => reject(err));
    //                         })
    //                         .catch(err => reject(err));
    //                     })
    //                     .catch(err => reject(err));
    //                 })
    //                 .catch(err => reject(err));
    //             };
    //         })
    //         .catch(err => reject(err));
    //     });
    // };

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
                } else resolve({links: [], orders: []});
            })
            .catch(err => reject(err));
        });
    };
    function get_orders_for_demand_lines(lines) {
        return new Promise((resolve, reject) => {
            let actions = [];
            lines.forEach(line => actions.push(get_orders_for_demand_line(line.demand_line_id, {id_only: true, active_only: true})));
            Promise.all(actions)
            .then(results => {
                let orders = [];
                results.forEach(e => orders = orders.concat(e.orders));
                resolve(orders);
            })
            .catch(err => reject(err));
        });
    };
    fn.demands.lines.cancel  = function (demand_line_id, user_id) {
        return new Promise ((resolve, reject) => {
            //Get the line to be canclled
            fn.demands.lines.get(demand_line_id)
            .then(line => {
                //Check it is Pending or Open
                if (line.status !== 1 && line.status !== 2) reject(new Error(`This line is ${line_status[line.status]}, only pending or open lines can be cancelled`))
                else {
                    //Set the lines status to cancelled
                    fn.update(line, {status: 0})
                    .then(result => {
                        //Get the order for this demand
                        get_orders_for_demand_line(line.demand_line_id, {active_only: true})
                        .then(result => {
                            let order_actions = [];
                            result.orders.forEach(order => {
                                //For each order, if its status is demanded, change to Placed and return order id
                                order_actions.push(new Promise((resolve, reject) => {
                                    if (order.status === 3) {
                                        fn.update(order, {status: 2})
                                        .then(result => resolve(order.order_id))
                                        .catch(err => reject(err));
                                    } else reject(new Error(`Non-allowed order status: ${order.status}`));
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
                                    fn.actions.create(
                                        'DEMAND LINE | CANCELLED',
                                        user_id,
                                        [{table: 'demand_lines', id: line.demand_line_id}].concat(order_links)
                                    )
                                    .then(result => resolve(true))
                                    .catch(err => {
                                        console.log(err);
                                        resolve(false);
                                    });
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

    function getDemandLines(where = {}, include = [], options = {}) {
        return new Promise((resolve, reject) => {
            m.demand_lines.findAll({
                where:   where,
                include: include
            })
            .then(lines => {
                if (
                    options.allowNull === true ||
                    (lines && lines.length > 0)
                )    resolve(lines)
                else reject(new Error('No lines found'));
            })
            .catch(err => reject(err));
        });
    };

    function get_template(supplier_id) {
        return new Promise((resolve, reject) => {
            fn.get(
                'suppliers',
                {supplier_id: supplier_id},
                [
                    fn.inc.stores.files({
                        where: {description: 'Demand'},
                        details: true
                    }),
                    fn.inc.stores.account()
                ]
            )
            .then(supplier => {
                if      (!supplier.files)              reject(new Error('No template for this supplier'))
                else if ( supplier.files.length === 0) reject(new Error('No demand files for this supplier'))
                else if ( supplier.files.length > 1)   reject(new Error('Multiple demand files for this supplier'))
                else if (!supplier.account)            reject(new Error('No account for this supplier'))
                else                                   resolve([supplier.files[0], supplier.account, supplier.supplier_id]);
            })
            .catch(err => reject(err));
        });
    };
    function get_sizes(lines, supplier_id) {
        return new Promise((resolve, reject) => {
            let sizes = [];
            lines.forEach(line => {
                if (
                    line.size.supplier_id === supplier_id &&
                    line.size.details.findIndex(e => e.name === 'Demand Page') !== -1 &&
                    line.size.details.findIndex(e => e.name === 'Demand Cell') !== -1
                ) {
                    let demand_page = line.size.details[line.size.details.findIndex(e => e.name === 'Demand Page')].value,
                        demand_cell = line.size.details[line.size.details.findIndex(e => e.name === 'Demand Cell')].value;
                    if (demand_page && demand_cell) {
                        let sizeIndex = sizes.findIndex(e => e.size_id === line.size_id);
                        if (sizeIndex === -1) {
                            sizes.push({
                                size_id: line.size_id,
                                qty:     line.qty,
                                page:    demand_page,
                                cell:    demand_cell
                            })
                        } else sizes[sizeIndex].qty += line.qty;
                    };
                };
            });
            if (sizes.length > 0) resolve(sizes)
            else                  reject(new Error('No sizes for this supplier with demand details'));
        });
    };
    function get_users(orders) {
        return new Promise((resolve, reject) => {
            let actions = [];
            orders.forEach(order_id => {
                actions.push(
                    new Promise((resolve, reject) => {
                        m.action_links.findAll({
                            where: {
                                _table: 'issues',
                                active: true
                            },
                            include: [{
                                model: m.actions,
                                where: {
                                    action: {[fn.op.or]: [
                                        'ORDER | CREATED',
                                        {[fn.op.startsWith]: 'ORDER | INCREMENTED'}
                                    ]}
                                },
                                include: [{
                                    model: m.action_links,
                                    as: 'links',
                                    where: {
                                        _table: 'orders',
                                        id: order_id,
                                        active: true
                                    }
                                }]
                            }]
                        })
                        .then(links => {
                            if (!links || links.length === 0) resolve([])
                            else {
                                let get_issues = [];
                                links.forEach(e => get_issues.push(fn.issues.get(e.id)));
                                Promise.allSettled(get_issues)
                                .then(results => {
                                    let users = [];
                                    results.filter(e => e.status === 'fulfilled').forEach(result => {
                                        if (result.value.user_issue) users.push(result.value.user_issue)
                                    });
                                    resolve(users);
                                })
                                .catch(err => reject(err))
                            };
                        })
                        .catch(err => reject(err))
                    })
                );
            });
            Promise.allSettled(actions)
            .then(results => {
                let users = [];
                results.filter(e => e.status === 'fulfilled' && e.value.length > 0).forEach(e => {
                    e.value.forEach(user => {
                        if (users.findIndex(e => e.user_id === user.user_id) === -1) {
                            users.push({
                                user_id: user.user_id,
                                name:    user.full_name,
                                rank:    user.rank.rank
                            })
                        };
                    });
                });
                resolve(users);
            })
            .catch(err => reject(err));
        });
    };
    function create_file(filename, demand_id) {
        return new Promise((resolve, reject) => {
            const fs = require('fs');
            if (filename) {
                let new_file = `${demand_id}.xlsx`;
                fs.copyFile(
                    `${process.env.ROOT}/public/res/files/${filename}`,
                    `${process.env.ROOT}/public/res/demands/${new_file}`,
                    function (err) {
                        if (err) reject(new Error(err))
                        else     resolve(new_file);
                    }
                );
            } else reject(new Error('No demand file specified'));
        });
    };
    function write_cover_sheet(template, account, file, users, raised_by_user) {
        return new Promise((resolve, reject) => {
            let details = {};
            details.cover_sheet = template.details.filter(e => e.name.toLowerCase() === 'cover sheet')[0].value
            if (details.cover_sheet) {
                ['code', 'name', 'rank', 'holder', 'squadron', 'date', 'rank column', 'name column', 'user start', 'user end'].forEach(e => {
                    if (template.details.filter(d => d.name.toLowerCase() === e).length === 1) {
                        details[e.replace(' ', '_')] = template.details.filter(d => d.name.toLowerCase() === e)[0].value
                    };
                });
                let ex       = require('exceljs'),
                    workbook = new ex.Workbook(),
                    path     = `${process.env.ROOT}/public/res/demands`;
                workbook.xlsx.readFile(`${path}/${file}`)
                .then(() => {
                    try {
                        let worksheet = workbook.getWorksheet(details.cover_sheet);
                        if (details.code)     worksheet.getCell(details.code)    .value = account.number;
                        if (details.name)     worksheet.getCell(details.name)    .value = raised_by_user.full_name;
                        if (details.rank)     worksheet.getCell(details.rank)    .value = raised_by_user.rank.rank;
                        if (details.holder)   worksheet.getCell(details.holder)  .value = `${account.user.rank.rank} ${account.user.full_name}`;
                        if (details.squadron) worksheet.getCell(details.squadron).value = account.name;
                        if (details.date)     worksheet.getCell(details.date)    .value = new Date().toDateString();
                        if (
                            users &&
                            details.rank_column &&
                            details.name_column &&
                            details.user_start  &&
                            details.user_end
                        ) {
                            let line = new fn.counter();
                            for (let r = Number(details.user_start); r <= Number(details.user_end); r++) {
                                let rankCell = worksheet.getCell(details.rank_column + r),
                                    nameCell = worksheet.getCell(details.name_column + r),
                                    currentLine = line() - 1,
                                    sortedKeys = Object.keys(users).sort(),
                                    user = users[sortedKeys[currentLine]];
                                if (user) {
                                    rankCell.value = user.rank;
                                    nameCell.value = user.name;
                                } else break;
                            };
                        };
                        workbook.xlsx.writeFile(`${path}/${file}`)
                        .then(() => resolve(true))
                        .catch(err => reject(err));
                    } catch (err) {
                        reject(err);
                    };
                }).catch(err => reject(err));
            } else reject(new Error('No cover sheet specified'));
        });
    };
    function write_items(file, sizes) {
        return new Promise((resolve, reject) => {
            let ex       = require('exceljs'),
                workbook = new ex.Workbook(),
                path     = `${process.env.ROOT}/public/res/demands`;
            workbook.xlsx.readFile(`${path}/${file}`)
            .then(() => {
                let fails = [];
                sizes.forEach(size => {
                    try {
                        let worksheet = workbook.getWorksheet(size.page),
                            cell      = worksheet.getCell(size.cell);
                        cell.value = size.qty;
                    } catch (err) {
                        fails.push({size_id: size.size_id, reason: err.message});
                    };
                });
                workbook.xlsx.writeFile(`${path}/${file}`)
                .then(() => resolve(fails))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};