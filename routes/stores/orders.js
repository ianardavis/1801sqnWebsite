module.exports = (app, m, pm, op, inc, li, send_error) => {
    let fn = {}, receipts = {}, issues = {};
    require(`${process.env.FUNCS}/allowed`)(m.permissions, fn);
    require(`${process.env.FUNCS}/promise_results`)(fn);
    require(`${process.env.FUNCS}/orders`) (m, fn);
    require(`${process.env.FUNCS}/demands`)(m, fn);
    // require(`${process.env.FUNCS}/receipts`)(m, receipts);
    app.get('/orders',        li, pm.get('access_orders'),   (req, res) => res.render('stores/orders/index'));
    app.get('/orders/:id',    li, pm.get('access_orders'),   (req, res) => res.render('stores/orders/show'));
    
    app.get('/count/orders',  li, pm.check('access_orders'), (req, res) => {
        m.orders.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => send_error(res, err));
    });

    app.get('/get/orders',    li, pm.check('access_orders'), (req, res) => {
        m.orders.findAll({
            where:   req.query,
            include: [
                inc.size(),
                inc.user()
            ]
        })
        .then(orders => res.send({success: true, result: orders}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/order',     li, pm.check('access_orders'), (req, res) => {
        m.orders.findOne({
            where:   req.query,
            include: [
                inc.size(),
                inc.user()
            ]
        })
        .then(order => res.send({success: true, result: order}))
        .catch(err => send_error(res, err));
    });

    app.post('/orders',       li, pm.check('order_add'),     (req, res) => {
        fn.orders.create(req.body.line, req.user.user_id)
        .then(result => res.send(result))
        .catch(err => send_error(res, err));
    });
    
    app.put('/orders',        li, pm.check('order_edit'),    (req, res) => {
        let actions = [];
        req.body.lines.filter(e => e.status === '0').forEach(line => actions.push(cancel_line( line, req.user.user_id)));
        actions.push(demand_orders(req.body.lines.filter(e => e.status === '2'), req.user.user_id));
        req.body.lines.filter(e => e.status === '3').forEach(line => actions.push(receive_line(line, req.user.user_id)));
        Promise.allSettled(actions)
        .then(results => {
            if (results.filter(e => e.status === 'rejected').length > 0) {
                console.log(results);
                res.send({success: true, message: 'Some lines failed'});
            } else res.send({success: true, message: 'Lines actioned'});
        })
        .catch(err => send_error(res, err));
    });
    
    app.delete('/orders/:id', li, pm.check('order_delete'),  (req, res) => {
        m.orders.findOne({
            where:      {order_id: req.params.id},
            attributes: ['order_id', 'status']
        })
        .then(order => {
            if      (!order)             send_error(res, 'Order not found');
            else if (order.status !== 1) send_error(res, 'Only placed orders can be cancelled');
            else {
                return order.update({status: 0})
                .then(results => {
                    if (!result) send_error(res, 'Order not cancelled')
                    else {
                        return m.actions.findAll({
                            where:      {order_id: order_id},
                            attributes: ['action_id'],
                            include: [inc.issue({attributes: ['issue_id', 'status']})]
                        })
                        .then(issues => {
                            let issue_actions = [];
                            issues.forEach(issue => {
                                if (issue.issue.status === 3) {
                                    issue_actions.push(issue.issue.update({status: 2}));
                                    issue_actions.push(m.actions.create({
                                        issue_id: issue.issue_id,
                                        _action:  'Order cancelled',
                                        order_id: order.order_id,
                                        user_id:  req.user.user_id
                                    }));
                                };
                            });
                            return Promise.allSettled(issue_actions)
                            .then(results => {
                                if (results.filter(e => e.status === 'rejected').length > 0) res.send({success: true,  message: 'Order cancelled, some issue actions have failed'})
                                else                                                         res.send({success: true,  message: 'Order cancelled'});
                            })
                            .catch(err => send_error(res, err));
                        })
                        .catch(err => send_error(res, err));
                    };
                })
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });

    function demand_orders(lines, user_id) {
        return new Promise((resolve, reject) => {
            return fn.allowed(user_id, 'demand_line_add')
            .then(result => {
                return get_orders(lines)
                .then(orders => {
                    return sort_suppliers(orders)
                    .then(suppliers => {
                        return create_demands(suppliers, user_id)
                        .then(suppliers => {
                            let demand_actions = []
                            suppliers.forEach(supplier => {
                                supplier.orders.forEach(order => {
                                    demand_actions.push(demand_line(order, supplier.demand_id, user_id));
                                })
                            });
                            Promise.all(demand_actions)
                            .then(results => resolve(true))
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
    function get_orders(lines) {
        return new Promise((resolve, reject) => {
            let actions = [];
            lines.forEach(line => {
                actions.push(
                    new Promise((resolve, reject) => {
                        return m.orders.findOne({
                            where:      {order_id: line.order_id},
                            include:    [inc.size({attributes: ['size_id', 'supplier_id']})],
                            attributes: ['order_id', 'size_id', 'status', 'qty']
                        })
                        .then(order => {
                            if      (!order)                  reject(new Error('Order not found'))
                            else if (order._status !== 1)     reject(new Error('Only placed orders can be demanded'))
                            else if (!order.size)             reject(new Error('Size not found'))
                            else if (!order.size.supplier_id) reject(new Error('Supplier not found'))
                            else                              resolve(order);
                        })
                        .catch(err => reject(err));
                    })
                );
            });
            Promise.allSettled(actions)
            .then(results => {
                let orders = [];

                results
                .filter( e => e.status === 'fulfilled')
                .forEach(e => orders.push(e.value));

                resolve(orders);
            })
            .catch(err => reject(err));
        });
    };
    function sort_suppliers(orders) {
        return new Promise((resolve, reject) => {
            let suppliers = [];
            orders.forEach(order => {
                let index = suppliers.findIndex(e => e.supplier_id === order.size.supplier_id)
                if (index === -1) {
                    suppliers.push({
                        supplier_id: order.size.supplier_id,
                        orders:      [order]
                    })
                } else suppliers[index].orders.push(order);
            });
            if (suppliers && suppliers.length === 0) reject(new Error('No suppliers'))
            else                                     resolve(suppliers);
        });
    };
    function create_demands(suppliers, user_id) {
        return new Promise((resolve, reject) => {
            let demand_actions = [];
            suppliers.forEach(supplier => {
                demand_actions.push(
                    new Promise((resolve, reject) => {
                        return fn.demands.create({
                            supplier_id: supplier.supplier_id,
                            user_Id:     user_id
                        })
                        .then(demand => {
                            supplier.demand_id = demand.demand_id;
                            resolve({supplier_id: supplier.supplier_id, demand_id: demand.demand_id});
                        })
                        .catch(err => reject(err));
                    })
                );
            });
            Promise.all(demand_actions)
            .then(results => {
                console.log(results);
                results.forEach(result => {
                    suppliers[suppliers.findIndex(e => e.supplier_id === result.supplier__id)].demand_id = result.demand_id;
                });
                resolve(suppliers)
            })
            .catch(err => reject(err));
        });
    };
    function demand_line(order, demand_id, user_id) {
        return new Promise((resolve, reject) => {
            return fn.demands.lines.create({
                demand_id: demand_id,
                size_id:   order.size_id,
                _qty:      order._qty,
                user_id:   user_id,
                note:      ' from order'
            })
            .then(line => {
                return order.update({_status: 2})
                .then(result => {
                    if (!result) resolve({success: true, message: 'Order added to demand, order not updated'})
                    else {
                        m.actions.create({
                            order_id:       order.order_id,
                            _action:        'Order added to demand',
                            demand_line_id: line.line_id,
                            user_id:        user_id
                        })
                        .then(action => resolve({success: true, message: 'Order added to demand'}))
                        .catch(err => {
                            console.log(err);
                            resolve({success: true, message: `Order added to demand, error creating action: ${err.message}`});
                        })
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    function receive_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return fn.allowed(user_id, 'demand_line_add')
            .then(result => {
                return m.orders.findOne({
                    where:      {order_id: line.order_id},
                    attributes: ['order_id', 'size_id', '_status', '_qty'],
                    include:    [inc.size({attributes: ['size_id', 'has_serials', 'supplier_id']})]
                })
                .then(order => {
                    if      (!order)             reject(new Error('Order not found'));
                    else if (order.status !== 1) reject(new Error('Only placed orders can be received'))
                    else {
                        let receive_action = null
                        if (order.size.has_serials) receive_action = receive_line_serial({...line, ...{size_id: order.size_id, _qty: order._qty, user_id: user_id}})
                        else                     receive_action = receive_line_stock( {...line, ...{size_id: order.size_id, _qty: order._qty, user_id: user_id}});
                        receive_action
                        .then(result => {
                            order.update({status: 3})
                            .then(update_result => {
                                if (!result) resolve({success: true, message: 'Order received, line not updated'})
                                else {
                                    m.actions.create({
                                        ...result,
                                        ...{
                                            order_id: order.order_id,
                                            action:   'Order received',
                                            user_id:  user_id
                                        }
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
                return m.locations.findOne({
                    where: {location_id: location.location_id}
                })
                .then(location => {
                    if (!location) reject(new Error(`Location not found for serial: ${serial._serial}`))
                    else           resolve(location.location_id);
                })
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
                return m.stocks.findOne({
                    where:      {stock_id: options.stock_id},
                    attributes: ['stock_id', 'location_id', '_qty'],
                    include:    [inc.location()]
                })
                .then(stock => {
                    if (!stock) reject(new Error('Stock record not found'))
                    else resolve(stock);
                })
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
            if (!options._serial) reject(new Error('No serial specified'))
            else {
                location_check(options.location)
                .then(location_id => {  
                    m.serials.findOrCreate({
                        where: {
                            _serial: options._serial,
                            size_id: options.size_id
                        },
                        defaults: {
                            location_id: location_id
                        }
                    })
                    .then(([serial,created]) => {
                        if      (created)            resolve({serial_id: serial.serial_id, location_id: location_id})
                        else if (serial.issue_id)    reject(new Error('This serial # is already issued'))
                        else if (serial.location_id) reject(new Error('This serial # is already in stock'))
                        else {
                            serial.update({location_id: location_id})
                            .then(result => {
                                if (!result) reject(new Error('Serial not received'))
                                else         resolve({serial_id: serial.serial_id, location_id: location_id})
                            })
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
                stock.increment('_qty', {by: options._qty})
                .then(result => {
                    if (!result) reject(new Error('Stock not received'))
                    else         resolve({stock_id: stock.stock_id, location_id: stock.location_id})
                })
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
                                    return m.demand_lines.findOne({
                                        where: {demand_id: demand.action_line_id},
                                        attributes: ['line_id', '_status', '_qty']
                                    })
                                    .then(demand_line => {
                                        if (demand_line._status === 1) {
                                            let demand_actions = [];
                                            if (line._qty < demand_line._qty) {
                                                demand_actions.push(demand_line.decrement('_qty', {by: line._qty}));
                                                demand_actions.push(
                                                    m.demand_line_actions.create({
                                                        demand_line_id: demand_line.line_id,
                                                        action_line_id: line.line_id,
                                                        _action: `Decremented by ${line._qty} from order line cancellation`,
                                                        user_id: user_id
                                                    })
                                                );
                                            } else if (line._qty === demand_line._qty) {
                                                demand_actions.push(demand_line.update({_status: 0}));
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
    function demand_order_line(line_id, user_id) {
        return new Promise((resolve, reject) => {
            return m.order_lines.findOne({
                where:      {line_id: line_id},
                include:    [inc.size({attributes: ['supplier_id']})],
                attributes: ['line_id', 'size_id', 'qty']
            })
            .then(order_line => {
                if      (!order_line)                                                         resolve({success: false, message: 'Order line not found'});
                else if (!order_line.size)                                                    resolve({success: false, message: 'Size not found'});
                else if (!order_line.size.supplier_id || order_line.size.supplier_id === '') {resolve({success: false, message: 'Size does not have a supplier specified'});
                } else {
                    fn.demands.create({
                        supplier_id: order_line.size.supplier_id,
                        user_id:     user_id
                    })
                    .then(demand_result => {
                        if (demand_result.success) {
                            fn.demands.lines.create({
                                demand_id: demand_result.demand.demand_id,
                                size_id:   order_line.size_id,
                                qty:       order_line.qty,
                                user_id:   user_id,
                                note:      ` from order line ${order_line.line_id}`
                            })
                            .then(line_result => {
                                if (line_result.success) {
                                    let actions = [];
                                    actions.push(order_line.update({_status: 3}));
                                    actions.push(m.order_line_actions.create({
                                        _action:        'Demand',
                                        order_line_id:  order_line.line_id,
                                        action_line_id: line_result.line.line_id,
                                        user_id:        user_id
                                    }));
                                    if (line_result.line.created) {
                                        actions.push(m.demand_line_actions.create({
                                            demand_line_id: line_result.line.line_id,
                                            action_line_id:  order_line.line_id,
                                            _action:   `Created from order line`,
                                            user_id: req.user.user_id
                                        }));
                                    };
                                    Promise.allSettled(actions)
                                    .then(new_note => resolve(line_result))
                                    .catch(err => {
                                        console.log(err);
                                        resolve({success: true, message: 'Line demanded. Some errors occured', line: {line_id: line_result.line_Id}});
                                    });
                                } else resolve(line_result);
                            })
                            .catch(err => reject(err));
                        } else resolve(demand_result);
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    function receive_order_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return m.order_lines.findOne({
                where: {line_id: line.line_id},
                include: [inc.size({attributes: ['supplier_id']})],
                attributes: ['line_id', 'size_id', 'qty']
            })
            .then(order_line => {
                if      (!order_line)                                                        resolve({success: false, message: 'Order line not found'});
                else if (!order_line.size)                                                   resolve({success: false, message: 'Size not found'});
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
                                    actions.push(order_line.update({_status: 4}))
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
            return m.order_lines.findOne({
                where:      {line_id: line.line_id},
                include:    [inc.order()],
                attributes: ['line_id', 'size_id', 'order_id', 'qty']
            })
            .then(order_line => {
                if (!order_line) resolve({success: false, message: 'Order line not found'})
                else {
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
                            return order_line.update({_status: 6})
                            .then(order_line_result => resolve({success: true, message: 'Order line created'}))
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
};