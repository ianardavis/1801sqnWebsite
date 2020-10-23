const op = require('sequelize').Op;
module.exports = (app, al, inc, li, m) => {
    let requests = require(process.env.ROOT + '/fn/requests'),
        orders   = require(process.env.ROOT + '/fn/orders'),
        issues   = require(process.env.ROOT + '/fn/issues');
    app.get('/stores/requests',             li, al('access_requests', {allow: true}),             (req, res) => res.render('stores/requests/index'));
    app.get('/stores/requests/:id',         li, al('access_requests', {allow: true}),             (req, res) => {
        m.requests.findOne({
            where: {request_id: req.params.id},
            attributes: ['requested_for']
        })
        .then(request => {
            if (!request) res.error.redirect(new Error('Request not found'), req, res)
            else if (!req.allowed && request.requested_for !== req.user.user_id) res.error.redirect(new Error('Permission denied'), req, res);
            else res.render('stores/requests/show', {tab: req.query.tab || 'details'});
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/request_lines/:id',    li, al('access_request_lines',         {send: true}), (req, res) => {
        m.request_lines.findOne({
            where: {line_id: req.params.id},
            attribute: ['request_id']
        })
        .then(line => {
            if (!line) res.error.redirect(new Error('Request line not found'), req, res);
            else res.redirect(`/stores/requests/${line.request_id}`)
        })
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/requests',            li, al('request_add',                  {send: true}), (req, res) => {
        requests.create({
            m: m.request,
            requested_for: req.body.requested_for,
            user_id:       req.user.user_id
        })
        .then(result => {
            let message = '';
            if (result.created) message = `Request raised: ${result.request_id}`
            else message = `Request already in draft for this user: ${result.request_id}`;
            res.send({result: true, message: message})
        })
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/request_lines/:id',   li, al('request_line_add',             {send: true}), (req, res) => {
        req.body.line.request_id = req.params.id;
        requests.createLine({
            m: {
                sizes: m.sizes,
                notes: m.notes,
                requests: m.requests,
                request_lines: m.request_lines
            },
            line: req.body.line,
            user_id: req.user.user_id
        })
        .then(line_id => res.send({result: true, message: 'Item added: ' + line_id}))
        .catch(err => res.error.send(err, res))
    });
    
    app.put('/stores/requests/:id',         li, al('request_edit',    {allow: true, send: true}), (req, res) => {
        m.requests.findOne({
            where: {request_id: req.params.id},
            include: [inc.request_lines({where: {_status: 1}, attributes: ['line_id']})],
            attributes: ['requested_for', '_status']
        })
        .then(request => {
            if (!request) {
                res.error.send('Request not found', res);
            } else if (!req.allowed && req.user.user_id !== request.requested_for) {
                res.error.send('Permission denied', res);
            } else if (request._status !== 1) {
                res.error.send('Request must be in draft to be completed', res);
            } else if (req.body._status === '2' && (!request.lines || request.lines.length === 0)) {
                res.error.send('A request must have at least one open line before you can complete it', res);
            } else if (req.body._status !== '0' && req.body._status !== '2') {
                res.error.send('Invalid status requested', res);
            } else {
                let _note = '';
                if      (req.body._status === '0') _note = 'Cancelled'
                else if (req.body._status === '2') _note = 'Completed';
                let actions = [];
                actions.push(
                    request.update(
                        {_status: req.body._status},
                        {where: {request_id: req.params.id}}
                    )
                );
                actions.push(
                    m.request_lines.update(
                        {_status: 2},
                        {where:{
                            request_id: request.request_id,
                            _status: 1
                        }}
                    )
                )
                actions.push(
                    m.notes.create({
                        _id:     req.params.id,
                        _table:  'requests',
                        _note:   _note,
                        _system: 1,
                        user_id: req.user.user_id
                    })
                );
                if (req.body._status === '0') {
                    actions.push(
                        m.request_lines.update(
                            {_status: 0},
                            {where: {request_id: req.params.id}}
                        )
                    );
                };
                return Promise.all(actions)
                .then(result => res.send({result: true, message: `Request ${_note.toLowerCase()}`}))
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/request_lines/:id',    li, al('request_line_edit',            {send: true}), (req, res) => {
        m.requests.findOne({
            where: { request_id: req.params.id },
            attributes: ['request_id', 'requested_for' , '_status']
        })
        .then(request => {
            if (request.requested_for === req.user.user_id) {
                res.error.send('You can not approve requests for yourself', res);
            } else if (request._status !== 2) {
                res.error.send('This request is not Open', res);
            } else {
                let _orders = [], _issues = [], actions = [];
                for (let [lineID, line] of Object.entries(req.body.actions)) {
                    line.line_id = Number(String(lineID).replace('line_id', ''));
                    if (line._status === '3') { // If Approved
                        if (line._action === 'Order') _orders.push(line)
                        else if (line._action === 'Issue') {
                            line.offset = _issues.length;
                            _issues.push(line);
                        }
                    } else if (line._status === '4') { // If Declined
                        // Update request line to declined
                        actions.push(
                            m.request_lines.update(
                                {
                                    _status: 4,
                                    _date: Date.now(),
                                    approved_by: req.user.user_id
                                },
                                {where: {line_id: line.line_id}}
                            )
                        );
                    };
                };
                if (_orders.length > 0) {
                    actions.push(new Promise((resolve, reject) => {
                        // Create/find open orders for user
                        return orders.create({
                            m:           {orders: m.orders, users: m.users},
                            ordered_for: request.requested_for,
                            user_id:     req.user.user_id
                        })
                        .then(order => {
                            let order_actions = [];
                            _orders.forEach(_order => {
                                order_actions.push(
                                    order_request_line(
                                        order.order_id,
                                        _order.line_id,
                                        req.user.user_id
                                    )
                                );
                            });
                            return Promise.all(order_actions)
                            .then(() => resolve(true))
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(`Unable to create order: ${err.message}`));
                    }));
                };
                if (_issues.length > 0) {
                    actions.push(new Promise((resolve, reject) => {
                        // Create/find open issues for user
                        return issues.create({
                            m:         {issues: m.issues, users: m.users},
                            issued_to: request.requested_for,
                            user_id:   req.user.user_id
                        })
                        .then(issue => {
                            let issue_actions = [];
                            return m.issue_lines.count({where: {issue_id: issue.issue_id}})
                            .then(lines => {
                                _issues.forEach(_issue => {
                                    issue_actions.push(
                                        issue_request_line(
                                            {
                                                issue_id: issue.issue_id,
                                                lines: lines
                                            },
                                            _issue,
                                            req.user.user_id
                                        )
                                    );
                                });
                                return Promise.all(issue_actions)
                                .then(results => resolve(true))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(`Unable to create issue: ${err.message}`));
                    }));
                };
                return Promise.all(actions)
                .then(results => {
                    return m.request_lines.count({
                        where: {
                            request_id: request.request_id,
                            _status:    2
                        }
                    })
                    .then(open_lines => {
                        if (open_lines > 0) return res.send({result: true, message: 'Lines actioned'})
                        else {
                            return m.requests.update(
                                {_status: 3},
                                {where: {request_id: request.request_id}}
                            )
                            .then(result => {
                                if (result) res.send({result: true, message: 'Lines actioned, request closed'});
                                else res.error.send('All lines actioned, could not close request', res);
                            })
                            .catch(err => res.error.send(err, res));
                        };
                    })
                    .catch(err => res.error.send(err, res));
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    
    app.delete('/stores/requests/:id',      li, al('request_delete',  {allow: true, send: true}), (req, res) => {
        m.requests.findOne({
            where: {request_id: req.params.id},
            attributes: ['_status', 'requested_for', 'request_id']
        })
        .then(request => {
            if (!request) return res.error.send('Request not found', res)
            else if (request.requested_for !== req.user.user_id && !allowed) return res.error.send('Permission denied', res)
            else if (request._status !== 1) return res.error.send('Only draft requests can be cancelled', res)
            else {
                return m.request_lines.update(
                    {_status: 0},
                    {where: {request_id: request.request_id}}
                )
                .then(result => {
                    return request.update({_status: 0})
                    .then(result => res.send({result: true, message: 'Request cancelled'}))
                    .catch(err => res.error.send(err, res));
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/request_lines/:id', li, al('request_delete',  {allow: true, send: true}), (req, res) => {
        m.request_lines.findOne({
            where: {line_id: req.params.id},
            attributes: ['_status'],
            include: [inc.requests({attributes:['_status', 'requested_for']})]
        })
        .then(line => {
            if (!allowed && line.request.requested_for !== req.user.user_id) {
                res.error.send('Permission denied', res);
            } else if (line.request._status !== 1) {
                res.error.send('Lines can only be cancelled whilst a request is in draft', res);
            } else if (line._status !== 1) {
                res.error.send('Only pending lines can be cancelled', res);
            } else {
                return line.update({_status: 0})
                .then(result => {
                    if (result) res.send({result: true, message: 'Line cancelled'})
                    else res.error.send('Line NOT cancelled', res);
                })
                .catch(err => res.error.send(err, res));
            };

        })
        .catch(err => res.error.send(err, res));
    });
    
    order_request_line = (order_id, line_id, user_id) => new Promise((resolve, reject) => {
        //Get request line
        return m.request_lines.findOne({
            where: {line_id: line_id},
            attributes: ['size_id','_qty','line_id']
        })
        .then(request_line => {
            return orders.createLine({
                m: {
                    order_lines: m.order_lines,
                    orders:      m.orders,
                    sizes:       m.sizes,
                    notes:       m.notes
                },
                line: {
                    order_id: order_id,
                    size_id:  request_line.size_id,
                    _qty:     request_line._qty,
                    user_id:  user_id
                },
                note_addition: ` from request line ${request_line.line_id}`
            })
            .then(result => {
                return request_line.update(
                    {
                        _status: 3,
                        _action: 'Order',
                        _date: Date.now(),
                        _id: result.line_id,
                        approved_by: user_id
                    }
                )
                .then(update_result => resolve(true))
                .catch(err => reject(`Unable to update request line: ${err.message}`));
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(`Unable to get request line: ${err.message}`));
    });
    issue_request_line = (issue, line, user_id) => new Promise((resolve, reject) => {
        // Get request line
        return m.request_lines.findOne({
            where: {line_id: line.line_id},
            attributes: ['size_id','_qty','line_id']
        })
        .then(request_line => {
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
                    serial_id: line.serial_id || null,
                    stock_id:  line.stock_id  || null,
                    nsn_id:    line.nsn_id    || null,
                    issue_id:  issue.issue_id,
                    size_id:   request_line.size_id,
                    user_id:   user_id,
                    _qty:      request_line._qty,
                    _line:     issue.lines + line.offset
                }
            })
            .then(line_id => {
                //update request line to approved and add issue line details
                return request_line.update(
                    {
                        _status: 3,
                        _action: 'Issue',
                        _date: Date.now(),
                        _id: line_id,
                        approved_by: user_id
                    }
                )
                .then(result => {
                    if (result) {
                        return m.notes.create({
                            _id:     issue.issue_id,
                            _table:  'issues',
                            _note:   `Line ${line_id} created from request line ${request_line.line_id}`,
                            user_id: user_id,
                            _system:  1
                        })
                        .then(note => resolve(line_id))
                        .catch(err => reject(err));

                    } else return reject(new Error(`Request line not updated`))
                })
                .catch(err => reject(`Unable to update request line: ${err.message}`));
            })
            .catch(err => reject(`Unable to find/create issue line: ${err.message}`));
        })
        .catch(err => reject(`Unable to get request line: ${err.message}`));
    });
};    