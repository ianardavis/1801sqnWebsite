const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db       = require(process.env.ROOT + '/fn/db'),
        requests = require(process.env.ROOT + '/fn/requests'),
        orders   = require(process.env.ROOT + '/fn/orders'),
        issues   = require(process.env.ROOT + '/fn/issues'),
        utils    = require(process.env.ROOT + '/fn/utils');
    app.get('/stores/requests',             isLoggedIn, allowed('access_requests',      {allow: true}),             (req, res) => res.render('stores/requests/index'));
    app.get('/stores/requests/:id',         isLoggedIn, allowed('access_requests',      {allow: true}),             (req, res) => {
        db.findOne({
            table: m.requests,
            where: {request_id: req.params.id},
            include: [
                inc.users({as: '_for'}),
                inc.users({as: '_by'})
        ]})
        .then(request => {
            if (req.allowed || request._for.user_id === req.user.user_id) {
                res.render('stores/requests/show', {
                    request: request,
                    show_tab: req.query.tab || 'details'
                });
            } else res.error.redirect(new Error('Permission denied'), req, res);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    
    app.get('/stores/get/requests',         isLoggedIn, allowed('access_requests',      {allow: true, send: true}), (req, res) => {
        if (!allowed) req.query.requested_for = req.user.user_id;
        m.requests.findAll({
            where: req.query,
            include: [
                inc.request_lines(),
                inc.users({as: '_for'}),
                inc.users({as: '_by'})
        ]})
        .then(requests => res.send({result: true, requests: requests}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/request_lines',        isLoggedIn, allowed('access_request_lines', {send: true}),              (req, res) => {
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
    app.get('/stores/request_lines/:id',    isLoggedIn, allowed('access_request_lines', {send: true}),              (req, res) => {
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

    app.post('/stores/requests',            isLoggedIn, allowed('request_add',          {send: true}),              (req, res) => {
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
    app.post('/stores/request_lines/:id',   isLoggedIn, allowed('request_line_add',     {send: true}),              (req, res) => {
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
    app.put('/stores/requests/:id',         isLoggedIn, allowed('request_edit',         {send: true, allow: true}), (req, res) => {
        m.requests.findOne({
            where: {request_id: req.params.id},
            include: [inc.request_lines({where: {_status: {[op.not]: 'Cancelled'}}})]
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
                        record: {_status: 'Open'}
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
    app.put('/stores/request_lines/:id',    isLoggedIn, allowed('request_edit',         {send: true}),              (req, res) => {
        db.findOne({
            table: m.requests,
            where: {request_id: req.params.id},
            include: [
                inc.users({as: '_for'})
        ]})
        .then(request => {
            if (request.requested_for === req.user.user_id) {
                res.error.send('You can not approve requests for yourself', result);
            } else {
                let _orders = [], _issues = [], actions = [];
                for (let [lineID, line] of Object.entries(req.body.actions)) {
                    line.line_id = Number(String(lineID).replace('line_id', ''));
                    if (line._action === 'Order') _orders.push(line)
                    else if (line._action === 'Issue') {
                        line.offset = _issues.length;
                        _issues.push(line);
                    } else if (line._status === 'Declined') {
                        actions.push(
                            db.update({
                                table: m.request_lines,
                                where: {line_id: line.line_id},
                                record: {
                                    _status: 'Declined',
                                    _date:   Date.now()
                                }
                            })
                        );
                        actions.push(
                            m.notes.create({
                                _id:     request.request_id,
                                _table:  'request_lines',
                                _note:   'Line ' + line.line_id + ' declined',
                                user_id: req.user.user_id,
                                system:  1
                            })
                        );
                    };
                };
                if (_orders.length > 0) {
                    actions.push(
                        orders.create({
                            m: {orders: m.orders},
                            order: {
                                ordered_for: request.requested_for,
                                user_id:     req.user.user_id
                            }
                        })
                    );
                };
                if (_issues.length > 0) {
                    actions.push(
                        issues.create({
                            m: {issues: m.issues},
                            issue: {
                                issued_to: request.requested_for,
                                user_id:   req.user.user_id
                            }
                        })
                    );
                };
                Promise.allSettled(actions)
                .then(results => {
                    actions = [];
                    if (_issues.length > 0) {
                        let issue_id = results.filter(e => e.value.hasOwnProperty('issue_id'))[0].value.issue_id;
                        if (issue_id) {
                            actions.push(
                                issue_request_lines(
                                    issue_id,
                                    _issues,
                                    req.user.user_id
                                )
                            )
                        };
                    };
                    if (_orders.length > 0) {
                        let order_id = results.filter(e => e.value.hasOwnProperty('order_id'))[0].value.order_id;
                        if (order_id) {
                            _orders.forEach(line => {
                                actions.push(
                                    order_request_line(
                                        order_id,
                                        line.line_id,
                                        req.user.user_id
                                    )
                                )
                            });
                        };
                    };
                    Promise.allSettled(actions)
                    .then(results => {
                        m.request_lines.findAll({
                            where: {
                                request_id: req.params.id,
                                _status:    'Open'
                            }
                        })
                        .then(open_lines => {
                            if (open_lines && open_lines.length > 0) {
                                if (utils.promiseResults(results)) res.send({result: true, message: 'Lines actioned'});
                                else res.error.send('Some actions failed', res);
                            } else {
                                db.update({
                                    table: m.requests,
                                    where: {request_id: req.params.id},
                                    record: {_closed: 1}
                                })
                                .then(_result => {
                                    if (utils.promiseResults(results)) res.send({result: true, message: 'Lines actioned, request closed'});
                                    else res.error.send('Some actions failed', res);
                                })
                                .catch(err => res.error.send(err, res));
                            };
                        })
                        .catch(err => res.error.send(err, res));
                    })
                    .catch(err => res.error.send(err, res));
                })
                .catch(err => res.error.send(err, res));
            };
        });
    });
    app.delete('/stores/request_lines/:id', isLoggedIn, allowed('request_line_delete',  {send: true}),              (req, res) => {
        db.destroy({
            table: m.request_lines,
            where: {line_id: req.params.id}
        })
        .then(result => res.send({result: true, message: 'Line deleted'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/requests/:id',      isLoggedIn, allowed('request_delete',       {send: true}),              (req, res) => {
        m.request_lines.destroy({where: {request_id: req.params.id}})
        .then(result => {
            db.destroy({
                table: m.requests,
                where: {request_id: req.params.id}
            })
            .then(result => res.send({result: true, message: 'Request deleted'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
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
                        _status: 'Approved',
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
        m.issue_lines.findAll({where: {issue_id: issue_id}})
        .then(issue_lines => {
            let actions = [];
            lines.forEach(line => {
                line._line = issue_lines.length + line.offset + 1;
                actions.push(issue_request_line(issue_id, line, user_id));
            });
            Promise.allSettled(actions)
            .then(results => resolve(utils.promiseResults(results)))
            .catch(err => reject(err))
        })
        .catch(err => reject(err));
    });
    issue_request_line = (issue_id, line, user_id) => new Promise((resolve, reject) => {
        db.findOne({
            table: m.request_lines,
            where: {line_id: line.line_id}
        })
        .then(request_line => {
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
                db.update({
                    table: m.request_lines,
                    where: {line_id: line.line_id},
                    record: {
                        _status: 'Approved',
                        _action: 'Issue',
                        _id:     result.line_id,
                        _date:   Date.now(),
                        user_id: user_id
                    }
                })
                .then(result => resolve(result.line_id))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
};