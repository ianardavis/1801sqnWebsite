module.exports = (app, m, fn) => {
    let receipts = {}, issues = {};
    app.get('/orders',        fn.loggedIn(), fn.permissions.get('access_orders'),   (req, res) => res.render('stores/orders/index'));
    app.get('/orders/:id',    fn.loggedIn(), fn.permissions.get('access_orders'),   (req, res) => res.render('stores/orders/show'));
    
    app.get('/count/orders',  fn.loggedIn(), fn.permissions.check('access_orders'), (req, res) => {
        m.orders.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/sum/orders',    fn.loggedIn(), fn.permissions.check('access_orders'), (req, res) => {
        m.orders.sum('qty', {where: req.query})
        .then(sum => res.send({success: true, result: sum}))
        .catch(err => fn.send_error(res, err));
    });

    app.get('/get/orders',    fn.loggedIn(), fn.permissions.check('access_orders'), (req, res) => {
        m.orders.findAll({
            where: req.query,
            include: [
                fn.inc.stores.size(),
                fn.inc.users.user()
            ]
        })
        .then(orders => res.send({success: true, result: orders}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/order',     fn.loggedIn(), fn.permissions.check('access_orders'), (req, res) => {
        fn.get(
            'orders',
            req.query,
            [
                fn.inc.stores.size(),
                fn.inc.users.user()
            ]
        )
        .then(order => res.send({success: true, result: order}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/orders',       fn.loggedIn(), fn.permissions.check('order_add'),     (req, res) => {
        if (!req.body.orders || req.body.orders.length === 0) fn.send_error(res, 'No orders submitted')
        else {
            let actions = [];
            req.body.orders.forEach(order => {
                if (order.qty && order.qty > 0) actions.push(fn.orders.create(order, req.user.user_id));
            });
            Promise.all(actions)
            .then(result => res.send({success: true, message: 'Orders placed'}))
            .catch(err => fn.send_error(res, err));
        };
    });
    
    app.put('/orders',        fn.loggedIn(), fn.permissions.check('order_edit'),    (req, res) => {
        let actions  = [],
            cancels  = req.body.orders.filter(e => e.status === '0'),
            demands  = req.body.orders.filter(e => e.status === '2'),
            receipts = req.body.orders.filter(e => e.status === '3');
        if (demands  && demands.length  > 0) actions.push(fn.orders.demand(demands, req.user.user_id));
        if (cancels  && cancels.length  > 0) cancels.forEach( order => actions.push(fn.orders.cancel( order.order_id)));
        if (receipts && receipts.length > 0) receipts.forEach(order => actions.push(fn.orders.receive(order.order_id)));
        Promise.allSettled(actions)
        .then(results => {
            if (results.filter(e => e.status === 'rejected').length > 0) {
                console.log(results);
                res.send({success: true, message: 'Some lines failed'});
            } else res.send({success: true, message: 'Lines actioned'});
        })
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/orders/:id', fn.loggedIn(), fn.permissions.check('order_delete'),  (req, res) => {
        fn.get(
            'orders',
            {order_id: req.params.id}
        )
        .then(order => {
            if (order.status !== 1) fn.send_error(res, 'Only placed orders can be cancelled');
            else {
                return fn.update(order, {status: 0})
                .then(results => {
                    return m.actions.findAll({
                        where:      {order_id: order_id},
                        attributes: ['action_id'],
                        include: [fn.inc.stores.issue()]
                    })
                    .then(issues => {
                        let issue_actions = [];
                        issues.forEach(issue => {
                            if (issue.issue.status === 3) {
                                issue_actions.push(fn.update(issue.issue, {status: 2}));
                                issue_actions.push(fn.actions.create({
                                    action:  'Order cancelled',
                                    user_id: req.user.user_id,
                                    links: [
                                        {table: 'issues', id: issue.issue_id},
                                        {table: 'orders', id: order.order_id}
                                    ]
                                }));
                            };
                        });
                        return Promise.allSettled(issue_actions)
                        .then(results => {
                            if (results.filter(e => e.status === 'rejected').length > 0) res.send({success: true,  message: 'Order cancelled, some issue actions have failed'})
                            else                                                         res.send({success: true,  message: 'Order cancelled'});
                        })
                        .catch(err => fn.send_error(res, err));
                    })
                    .catch(err => fn.send_error(res, err));
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });

    function receive_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return fn.allowed(user_id, 'demand_line_add')
            .then(result => {
                fn.get(
                    'orders',
                    {order_id: line.order_id},
                    [fn.inc.stores.size()]
                )
                .then(order => {
                    if (order.status !== 1) reject(new Error('Only placed orders can be received'))
                    else {
                        let receive_action = null
                        if (order.size.has_serials) receive_action = receive_line_serial({...line, ...{size_id: order.size_id, _qty: order._qty, user_id: user_id}})
                        else                        receive_action = receive_line_stock( {...line, ...{size_id: order.size_id, _qty: order._qty, user_id: user_id}});
                        receive_action
                        .then(result => {
                            fn.update(order, {status: 3})
                            .then(update_result => {
                                if (!result) resolve({success: true, message: 'Order received, line not updated'})
                                else {
                                    fn.actions.create({
                                        action:  'Order received',
                                        user_id: user_id,
                                        links: [{table: 'orders', id: order.order_id}].concat(result)
                                    })
                                    .then(action => resolve({success: true, message: 'Order received'}))
                                    .catch(err => {
                                        console.log(err);
                                        resolve({success: true, message: `Order received, error creating action: ${err.message}`});
                                    });
                                };
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function location_check(location) {
        return new Promise((resolve, reject) => {
            if (location.location_id && location.location_id !== '') {
                fn.get(
                    'locations',
                    {location_id: location.location_id}
                )
                .then(location => resolve(location.location_id))
                .catch(err => reject(err));
            } else if (location._location && location._location !== '') {
                return m.locations.findOrCreate({
                    where: {_location: location._location}
                })
                .then(([location, created]) => resolve(location.location_id))
                .catch(err => reject(err));
            } else reject(new Error('No location specified'));
        });
    };
    function stock_check(options) {
        return new Promise((resolve, reject) => {
            if (options.stock_id) {
                return fn.get(
                    'stocks',
                    {stock_id: options.stock_id},
                    [fn.inc.stores.location()]
                )
                .then(stock => resolve(stock))
                .catch(err => reject(err));
            } else {
                location_check(options.location)
                .then(location_id => {
                    return m.stocks.findOrCreate({
                        where:    {location_id: location_id},
                        defaults: {size_id:     options.size_id}
                    })
                    .then(([stock, created]) => {
                        if (!stock) reject(new Error('Stock record not found'))
                        else resolve(stock)
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            };
        });
    };
    function receive_line_serial (options) {
        return new Promise((resolve, reject) => {
            if (!options.serial) reject(new Error('No serial specified'))
            else {
                location_check(options.location)
                .then(location_id => {  
                    m.serials.findOrCreate({
                        where: {
                            serial:  options.serial,
                            size_id: options.size_id
                        },
                        defaults: {
                            location_id: location_id
                        }
                    })
                    .then(([serial,created]) => {
                        if      (created)            resolve([{table: 'serials', id: serial.serial_id}, {table: 'locations', id: location_id}])
                        else if (serial.issue_id)    reject(new Error('This serial # is already issued'))
                        else if (serial.location_id) reject(new Error('This serial # is already in stock'))
                        else {
                            return fn.update(serial, {location_id: location_id})
                            .then(result => resolve([{table: 'serials', id: serial.serial_id}, {table: 'locations', id: location_id}]))
                            .catch(err => reject(err));
                        };
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            };
        });
    };
    function receive_line_stock (options) {
        return new Promise((resolve, reject) => {
            stock_check(options)
            .then(stock => {
                fn.increment(stock, options.qty)
                .then(result => resolve([{table: 'stocks', id: stock.stock_id}, {table: 'locations', id: stock.location_id}]))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    function cancel_order_line(line, user_id) {
        return new Promise((resolve, reject) => {
            let actions = [];
            if (line._status === 1 || line._status === 2 || line._status === 4) {
                actions.push(m.order_lines.update({_status: 0}, {where: {line_id: line.line_id}}));
                actions.push(m.order_line_actions.create({
                    order_line_id: line.line_id,
                    _action: `cancelled`,
                    user_id: user_id
                }));
            } else if (line._status === 3) { // if demanded
                if (line.actions && line.actions.length > 0) {
                    let _demands = line.actions.filter(e => e.action.toLowerCase() === 'demand')
                    if (_demands.length > 0) {
                        _demands.forEach(demand => {
                            actions.push(
                                new Promise((resolve, reject) => {
                                    return fn.get(
                                        'demand_lines',
                                        {demand_id: demand.action_line_id}
                                    )
                                    .then(demand_line => {
                                        if (demand_line._status === 1) {
                                            let demand_actions = [];
                                            if (line._qty < demand_line._qty) {
                                                demand_actions.push(fn.decrement(demand_line, line._qty));
                                                demand_actions.push(
                                                    m.demand_line_actions.create({
                                                        demand_line_id: demand_line.line_id,
                                                        action_line_id: line.line_id,
                                                        _action: `Decremented by ${line._qty} from order line cancellation`,
                                                        user_id: user_id
                                                    })
                                                );
                                            } else if (line._qty === demand_line._qty) {
                                                demand_actions.push(fn.update(demand_line, {_status: 0}));
                                                demand_actions.push(
                                                    m.demand_line_actions.create({
                                                        demand_line_id: demand_line.line_id,
                                                        action_line_id: line.line_id,
                                                        _action: `Cancelled from order line cancellation`,
                                                        user_id: user_id
                                                    })
                                                );
                                            } else resolve({success: false, message: 'Order qty is greater than demand qty'});
                                            if (demand_actions.length > 0) {
                                                Promise.allSettled(demand_actions)
                                                .then(results => {
                                                    if (fn.promise_results(results)) resolve({success: true, message: 'Demand line cancelled'})
                                                    else resolve({success: false, message: 'Some demand actions failed'})
                                                })
                                                .catch(err => reject(err));
                                            } else resolve({success: false, message: 'No demand action'});
                                        } else resolve({success: false, message: 'Only pending lines can be cancelled'})
                                    })
                                    .catch(err => reject(err));
                                })
                            );
                        });
                    };
                };
                actions.push(m.order_lines.update({_status: 0}, {where: {line_id: line.line_id}}));
                actions.push(m.order_line_actions.create({
                    order_line_id: line.line_id,
                    _action: `Cancelled`,
                    user_id: user_id
                }));
            };
            Promise.allSettled(actions)
            .then(results => {
                if (fn.promise_results(results)) resolve({success: true, message: 'Line cancelled'})
                else resolve({success: false, message: 'Some actions failed cancelling line'});
            })
            .catch(err => reject(err));
        });
    };
    function receive_order_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return fn.get(
                'order_lines',
                {line_id: line.line_id},
                [fn.inc.stores.size()]
            )
            .then(order_line => {
                if      (!order_line.size)                                                   resolve({success: false, message: 'Size not found'});
                else if (!order_line.size.supplier_id || order_line.size.supplier_id === '') resolve({success: false, message: 'Size does not have a supplier specified'});
                else {
                    receipts.create({
                        supplier_id: order_line.size.supplier_id,
                        user_id: user_id
                    })
                    .then(receipt_result => {
                        if (receipt_result.success) {
                            receipts.createLine({
                                size_id:    order_line.size_id,
                                _qty:       order_line._qty,
                                receipt_id: receipt_result.receipt.receipt_id,
                                serials:    line.serials || null,
                                receive_to: {...line.location, ...{stock_id: line.stock_id}},
                                user_id:    user_id,
                                note:       ` from order line ${order_line.line_id}`
                            })
                            .then(line_result => {
                                if (line_result.success) {
                                    let actions = [];
                                    actions.push(fn.update(order_line, {_status: 4}))
                                    actions.push(m.order_line_actions.create({
                                        _action:        'Receipt',
                                        order_line_id:  order_line.line_id,
                                        action_line_id: line_result.line.line_id,
                                        user_id:        user_id
                                    }));
                                    if (line_result.line.created) {
                                        actions.push(m.receipt_line_actions.create({
                                            receipt_line_id: line_result.line.line_id,
                                            action_line_id: order_line.line_id,
                                            _action:   `Created from order line`,
                                            user_id: user_id
                                        }));
                                    };
                                    Promise.allSettled(actions)
                                    .then(new_note => resolve(line_result))
                                    .catch(err => {
                                        console.log(err);
                                        resolve({success: true, message: 'Line received. Note not created', line: {line_id: line_result.line_Id}});
                                    })
                                } else resolve(line_result);
                            })
                            .catch(err => reject(err));
                        } else resolve(receipt_result);
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    function issue_order_line(issue, line, user_id) {
        new Promise((resolve, reject) => {
            return fn.get(
                'order_lines',
                {line_id: line.line_id},
                ['line_id', 'size_id', 'order_id', 'qty']
            )
            .then(order_line => {
                return issues.createLine({
                    serial_id: line.serial_id || null,
                    issue_id:  issue.issue_id,
                    stock_id:  line.stock_id  || null,
                    size_id:   order_line.size_id,
                    user_id:   user_id,
                    nsn_id:    line.nsn_id    || null,
                    _line:     issue.count + line.offset + 1,
                    _qty:      order_line.qty
                })
                .then(line_result => {
                    return m.order_line_actions.create({
                        action_line_id: line_result.line.line_id,
                        order_line_id:  order_line.line_id,
                        user_id:        user_id,
                        _action:        'Issue'
                    })
                    .then(action_result => {
                        return fn.update(order_line, {_status: 6})
                        .then(order_line_result => resolve({success: true, message: 'Order line created'}))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};