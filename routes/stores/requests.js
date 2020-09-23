const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db       = require(process.env.ROOT + '/fn/db'),
        requests = require(process.env.ROOT + '/fn/requests'),
        orders   = require(process.env.ROOT + '/fn/orders'),
        issues   = require(process.env.ROOT + '/fn/issues'),
        utils    = require(process.env.ROOT + '/fn/utils');
    app.get('/stores/requests',           isLoggedIn, allowed('access_requests',      {allow: true}),             (req, res) => res.render('stores/requests/index'));
    app.get('/stores/requests/:id',       isLoggedIn, allowed('access_requests',      {allow: true}),             (req, res) => {
        db.findOne({
            table: m.requests,
            where: {request_id: req.params.id},
            include: [inc.users({as: '_for'})]
        })
        .then(request => {
            if (req.allowed || request._for.user_id === req.user.user_id) {
                res.render('stores/requests/show', {tab: req.query.tab || 'details'});
            } else res.error.redirect(new Error('Permission denied'), req, res);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/request_lines',      isLoggedIn, allowed('access_request_lines', {send: true}),              (req, res) => {
        m.request_lines.findAll({
            where: req.query,
            include: [
                inc.sizes(),
                inc.users(),
                inc.requests()
        ]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/request_lines/:id',  isLoggedIn, allowed('access_request_lines', {send: true}),              (req, res) => {
        m.request_lines.findAll({
            where:req.query,
            include:[
                inc.sizes(),
                inc.users(),
                inc.requests({
                    where: {requested_for: req.params.id},
                    required: true
        })]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/requests',          isLoggedIn, allowed('request_add',          {send: true}),              (req, res) => {
        requests.create({
            m: {requests: m.request},
            request: {
                requested_for: req.body.requested_for,
                user_id:       req.user.user_id
            }
        })
        .then(result => {
            let message = 'Request raised: ';
            if (!result.created) message = 'There is already a request open for this user: ';
            res.send({result: true, message: message + request_id})
        })
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/request_lines/:id', isLoggedIn, allowed('request_line_add',     {send: true}),              (req, res) => {
        req.body.line.request_id = req.params.id;
        req.body.line.user_id  = req.user.user_id;
        request.createLine({
            m: {
                sizes: m.sizes,
                requests: m.requests,
                request_lines: m.request_lines
            },
            line: req.body.line
        })
        .then(line_id => res.send({result: true, message: 'Item added: ' + line_id}))
        .catch(err => res.error.send(err, res))
    });
    
    app.put('/stores/requests/:id',       isLoggedIn, allowed('request_edit',         {send: true, allow: true}), (req, res) => {
        m.requests.findOne({
            where: {request_id: req.params.id},
            include: [inc.request_lines({where: {_status: {[op.not]: 0}}})]
        })
        .then(request => {
            if (!request.lines || request.lines.length === 0) {
                res.error.send('A request must have at least one open line before you can complete it', res);
            } else if (request._complete) {
                res.error.send('Request is already complete', res);
            } else if (!req.allowed && req.user.user_id !== request.requested_for) {
                res.error.send('Permission denied', res);
            } else {
                let actions = [];
                actions.push(
                    db.update({
                        table: m.requests,
                        where: {request_id: req.params.id},
                        record: {_complete: 1}
                    })
                );
                actions.push(
                    db.update({
                        table: m.request_lines,
                        where: {request_id: req.params.id},
                        record: {_status: 0}
                    })
                );
                Promise.allSettled(actions)
                .then(_result => {
                    if (utils.promiseResults(_result)) {
                        m.notes.create({
                                _table:  'requests',
                                _note:   'Completed',
                                _id:      req.params.id,
                                user_id: req.user.user_id,
                                system:  1
                            })
                        .then(note => res.send({result: true, message: 'Request marked as complete'}))
                        .catch(err => res.error.send(err, res));
                    } else res.error.send('Some actions have failed', res)
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/request_lines/:id',  isLoggedIn, allowed('request_edit',         {send: true}),              (req, res) => {
        m.requests.findOne({
            where: { request_id: req.params.id },
            attributes: ['requested_for', '_status', 'request_id']
        })
        .then(request => {
            if (request.requested_for === req.user.user_id) res.error.send('You can not approve requests for yourself', res)
            else if (request._status !== 2) res.error.send('This request is not Open', res)
            else {
                let _orders = [], _issues = [], actions = [];
                for (let [lineID, line] of Object.entries(req.body.actions)) {
                    line.line_id = Number(String(lineID).replace('line_id', ''));
                    if (line._status === '1') { // If Approved
                        if (line._action === 'Order') _orders.push(line)
                        else if (line._action === 'Issue') {
                            line.offset = _issues.length;
                            _issues.push(line);
                        }
                    } else if (line._status === '2') { // If Declined
                        // Update request line to declined
                        actions.push(
                            m.request_lines.update(
                                {
                                    _status: 2,
                                    _date: Date.now(),
                                    user_id: req.user.user_id
                                },
                                {where: {line_id: line.line_id}}
                            )
                        );
                        // Add note to request
                        actions.push(
                            m.notes.create({
                                _id:     request.request_id,
                                _table:  'requests',
                                _note:   `Line ${line.line_id} declined`,
                                user_id: req.user.user_id,
                                system:  1
                            })
                        );
                    };
                };
                if (_orders.length > 0) {
                    actions.push(new Promise((resolve, reject) => {
                        // create/find open orders for user 
                        m.orders.findOrCreate({
                            where: {
                                ordered_for: request.requested_for,
                                _status: 1
                            },
                            defaults: {user_id: req.user.user_id}
                        })
                        .then(([order, created]) => {
                            let order_actions = [];
                            _orders.forEach(_order => {
                                order_actions.push(new Promise((resolve, reject) => {
                                    //Get request line
                                    m.request_lines.findOne({
                                        where: {line_id: _order.line_id},
                                        attributes: ['size_id','_qty','line_id','request_id']
                                    })
                                    .then(request_line => {
                                        //create order line or get if already exists for size
                                        m.order_lines.findOrCreate({
                                            where: {
                                                order_id: order.order_id,
                                                size_id: request_line.size_id,
                                                _status: 0
                                            },
                                            defaults: {_qty: request_line._qty}
                                        })
                                        .then(([line, created]) => {
                                            //update request line to approved and add order line details
                                            m.request_lines.update(
                                                {
                                                    _status: 1,
                                                    _action: 'Order',
                                                    _date: Date.now(),
                                                    _id: line.line_id,
                                                    user_id: req.user.user_id
                                                },
                                                {
                                                    where: {line_id: request_line.line_id}
                                                }
                                            )
                                            .then(result => {
                                                if (!created) {
                                                    //increment order line if already exists
                                                    line.increment('_qty', {by: request_line._qty})
                                                    .then(result => {
                                                        console.log(`Requests:214 ${result}`);
                                                        //add note to order
                                                        m.notes.create({
                                                            _id:     order.order_id,
                                                            _table:  'orders',
                                                            _note:   `Line ${line.line_id} incremented by ${request_line._qty} from request line ${request_line.line_id}`,
                                                            user_id: req.user.user_id,
                                                            system:  1
                                                        })
                                                        .then(note => resolve(true))
                                                        .catch(err => reject(err));
                                                    })
                                                    .catch(err => reject(err));
                                                } else {
                                                    //add note to order
                                                    m.notes.create({
                                                        _id:     order.order_id,
                                                        _table:  'orders',
                                                        _note:   `Line ${line.line_id} created from request line ${request_line.line_id}`,
                                                        user_id: req.user.user_id,
                                                        system:  1
                                                    })
                                                    .then(note => resolve(true))
                                                    .catch(err => reject(err));
                                                };
                                            })
                                            .catch(err => reject(`Unable to update request line: ${err.message}`));
                                        })
                                        .catch(err => reject(`Unable to find/create order line: ${err.message}`));
                                    })
                                    .catch(err => reject(`Unable to get request line: ${err.message}`));
                                }));
                            });
                            Promise.all(order_actions)
                            .then(results => {
                                console.log(`Requests:249 ${results}`);
                                resolve(true);
                            })
                            .catch(err => console.log(err));
                        })
                        .catch(err => reject(`Unable to create order: ${err.message}`));
                    }));
                };
                if (_issues.length > 0) {
                    actions.push(new Promise((resolve, reject) => {
                        // Create/find open issues for user
                        return issues.create({
                            m:         m.issues,
                            issued_to: request.requested_for,
                            user_id:   req.user.user_id
                        })
                        .then(issue => {
                            let issue_actions = [];
                            return m.issue_lines.count({where: {issue_id: issue.issue_id}})
                            .then(lines => {
                                _issues.forEach(_issue => {
                                    issue_actions.push(new Promise((resolve, reject) => {
                                        // Get request line
                                        return m.request_lines.findOne({
                                            where: {line_id: _issue.line_id},
                                            attributes: ['size_id','_qty','line_id','request_id']
                                        })
                                        .then(request_line => {
                                            console.log(`Requests:279`, request_line.dataValues);
                                            // Create issue line for size
                                            return issues.createLine({
                                                m: {
                                                    issue_lines: m.issue_lines,
                                                    serials:     m.serials,
                                                    issues:      m.issues,
                                                    sizes:       m.sizes,
                                                    stock:       m.stock
                                                },
                                                line: {
                                                    serial_id: _issue.serial_id || null,
                                                    stock_id:  _issue.stock_id  || null,
                                                    nsn_id:    _issue.nsn_id    || null,
                                                    issue_id:  issue.issue_id,
                                                    size_id:   request_line.size_id,
                                                    user_id:   req.user.user_id,
                                                    _status:   0,
                                                    _qty:      request_line._qty,
                                                    _line:     lines + _issue.offset
                                                }
                                            })
                                            .then(line_id => {
                                                //update request line to approved and add issue line details
                                                return m.request_lines.update(
                                                    {
                                                        _status: 1,
                                                        _action: 'Issue',
                                                        _date: Date.now(),
                                                        _id: line_id,
                                                        user_id: req.user.user_id
                                                    },
                                                    {
                                                        where: {line_id: request_line.line_id}
                                                    }
                                                )
                                                .then(result => {
                                                    return m.notes.create({
                                                        _id:     issue.issue_id,
                                                        _table:  'issues',
                                                        _note:   `Line ${line_id} created from request line ${request_line.line_id}`,
                                                        user_id: req.user.user_id,
                                                        system:  1
                                                    })
                                                    .then(note => resolve(true))
                                                    .catch(err => reject(err));
                                                })
                                                .catch(err => reject(`Unable to update request line: ${err.message}`));
                                            })
                                            .catch(err => reject(`Unable to find/create issue line: ${err.message}`));
                                        })
                                        .catch(err => reject(`Unable to get request line: ${err.message}`));
                                    }));
                                });
                                Promise.all(issue_actions)
                                .then(results => {
                                    console.log(`Requests:339 ${results}`);
                                    resolve(true);
                                })
                                .catch(err => reject(err));
                                return null;
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(`Unable to create issue: ${err.message}`));
                    }));
                };
                Promise.all(actions)
                .then(results => {
                    m.request_lines.count({
                        where: {
                            request_id: req.params.id,
                            _status:    0
                        }
                    })
                    .then(open_lines => {
                        console.log(`Requests:357 Open lines ${open_lines}`);
                        if (open_lines > 0) {
                            if (utils.promiseResults(results)) res.send({result: true, message: 'Lines actioned'});
                            else res.error.send('Some actions failed', res);
                        } else {
                            m.requests.update(
                                {_status: 3},
                                {where: {request_id: req.params.id}}
                            )
                            .then(_result => {
                                if (utils.promiseResults(results)) res.send({result: true, message: 'Lines actioned, request closed'});
                                else res.error.send('Some actions failed', res);
                                return null;
                            })
                            .catch(err => res.error.send(err, res));
                        };
                        return null;
                    })
                    .catch(err => res.error.send(err, res));
                    return null;
                })
                .catch(err => res.error.send(err, res));
                return null;
            };
        })
        .catch(err => res.error.send(err, res));
        return null;
    });
    
    order_request_line = (order_id, line_id, user_id) => new Promise((resolve, reject) => {
        db.findOne({
            table: m.request_lines,
            where: {line_id: line_id}
        })
        .then(line => {
            m.order_lines.create({
                order_id: order_id,
                size_id:  line.size_id,
                _qty:     line._qty,
                user_id:  user_id
            })
            .then(new_line => {
                db.update({
                    table: m.request_lines,
                    where: {line_id: line_id},
                    record: {
                        _status: 1,
                        _action: 'Order',
                        _id:     new_line.line_id,
                        _date:   Date.now(),
                        user_id: user_id
                    }
                })
                .then(result => resolve(new_line.line_id))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
    issue_request_lines = (issue_id, lines, user_id) => new Promise((resolve, reject) => {
        console.log('hit1');
        m.issue_lines.findAll({where: {issue_id: issue_id}})
        .then(issue_lines => {
            console.log('hit2');
            let actions = [];
            lines.forEach(line => {
                line._line = issue_lines.length + line.offset + 1;
                actions.push(issue_request_line(issue_id, line, user_id));
            });
            Promise.allSettled(actions)
            .then(results => {
                console.log('hit3');resolve(utils.promiseResults(results))})
            .catch(err => reject(err))
        })
        .catch(err => reject(err));
    });
    issue_request_line = (issue_id, line, user_id) => new Promise((resolve, reject) => {
        console.log('hit4');
        m.request_lines.findByPk(line.line_id)
        // db.findOne({
        //     table: m.request_lines,
        //     where: {line_id: line.line_id}
        // })
        .then(request_line => {
            console.log('hit5');
            let _line = {
                stock_id: line.stock_id,
                issue_id: issue_id,
                size_id:  request_line.size_id,
                user_id:  user_id,
                _qty:     request_line._qty
            };
            if (line.nsn_id)    _line.nsn_id    = line.nsn_id;
            if (line.serial_id) _line.serial_id = line.serial_id;
            issues.createLine({
                m: {
                    sizes: m.sizes,
                    issues: m.issues,
                    issue_lines: m.issue_lines,
                    serials: m.serials,
                    stock: m.stock
                },
                line: _line
            })
            .then(result => {
                console.log('hit6');
                db.update({
                    table: m.request_lines,
                    where: {line_id: line.line_id},
                    record: {
                        _status: 1,
                        _action: 'Issue',
                        _id:     result,
                        _date:   Date.now(),
                        user_id: user_id
                    }
                })
                .then(result => {
                    console.log('hit7');resolve(result.line_id)})
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
};