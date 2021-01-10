const op = require('sequelize').Op;
module.exports = (app, al, inc, pm, m) => {
    let orders = {}, issues = {}, loancards = {},
    Counter = require('../functions/counter');
    require('./functions/loancards')(m, loancards);
    require('./functions/orders')   (m, orders);
    require('./functions/issues')   (m, issues);
    app.get('/stores/issues',            pm, al('access_issues', {allow: true}),             (req, res) => res.render('stores/issues/index'));
    app.get('/stores/issues/:id',        pm, al('access_issues', {allow: true}),             (req, res) => {
        m.stores.issues.findOne({
            where: {issue_id: req.params.id},
            attributes: ['user_id_issue']
        })
        .then(issue => {
            if      (!issue)                                                   res.error.redirect(new Error('Issue not found'),   req, res)
            else if (!req.allowed && issue.user_id_issue !== req.user.user_id) res.error.redirect(new Error('Permission denied'), req, res)
            else                                                               res.render('stores/issues/show');
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    
    app.get('/stores/count/issues',      pm, al('access_issues',              {send: true}), (req, res) => {
        m.stores.issues.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/issues',        pm, al('access_issues', {allow: true, send: true}), (req, res) => {
        if (!req.allowed) req.query.user_id_issue = req.user.user_id;
        m.stores.issues.findAll({
            where: req.query,
            include: [
                inc.users({as: 'user_issue'}),
                inc.users({as: 'user'})
            ]
        })
        .then(issues => res.send({success: true, result: issues}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/issues',        pm, al('access_issues', {allow: true, send: true}), (req, res) => {
        if (!req.allowed) req.query.user_id_issue = req.user.user_id;
        m.stores.issues.findOne({
            where: req.query,
            include: [
                inc.users({as: 'user_issue'}),
                inc.users({as: 'user'})
            ]
        })
        .then(issue => {
            if (!issue) res.send({success: false, message: 'Issue not found'})
            else if (
                !req.allowed &&
                issue.user_id_issue !== req.user.user_id
            )           res.send({success: false, message: 'Permission denied'})
            else        res.send({success: true,  result: issue});
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/issue_actions', pm, al('access_issues',              {send: true}), (req, res) => {
        m.stores.issue_line_actions.findAll({
            where:   req.query,
            include: [inc.users()]
        })
        .then(actions => res.send({success: true, result: actions}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/issues',           pm, al('issue_add',     {allow: true, send: true}), (req, res) => {
        let _status = 1;
        if (req.allowed) _status = 2;
        issues.create(
            req.body.line,
            ...{
                _status: _status,
                user_id: req.user.user_id
            }
        )
        .then(result => res.send(result))
        .catch(err => res.error.send(err, res));
    });
    
    app.put('/stores/issues/:id',        pm, al('issue_edit',    {allow: true, send: true}), (req, res) => {
        issues.update(
            req.body.line,
            ...{user_id: req.user.user_id}
        )
        .then(result => res.send(result))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/issue_lines/:id',   pm, al('issue_line_edit',            {send: true}), (req, res) => {
        m.stores.requests.findOne({
            where: { request_id: req.params.id },
            attributes: ['request_id', 'user_id_request' , '_status']
        })
        .then(request => {
            if      (request.user_id_request === req.user.user_id) res.send({success: false, message: 'You can not approve requests for yourself'})
            else if (request._status !== 2)                      res.send({success: false, message: 'This request is not open'})
            else {
                let actions = [],
                    _issues   = req.body.actions.filter(e => e._status === '3' && e._action === 'Issue'),
                    _orders   = req.body.actions.filter(e => e._status === '3' && e._action === 'Order'),
                    _declines = req.body.actions.filter(e => e._status === '4');
                if (_orders.length > 0) {
                    actions.push(
                        new Promise((resolve, reject) => {
                            orders.create(
                                request.user_id_request,
                                req.user.user_id
                            )
                            .then(order => {
                                if (order.success) {
                                    let order_actions = [];
                                    _orders.forEach(_order => {
                                        order_actions.push(
                                            new Promise((resolve, reject) => {
                                                m.stores.request_lines.findOne({
                                                    where:      {line_id: _order.line_id},
                                                    attributes: ['line_id', '_status', 'size_id', '_qty']
                                                })
                                                .then(line => {
                                                    if     (!line)               resolve({success: false, message: 'Request line not found'})
                                                    else if (line._status !== 2) resolve({success: false, message: 'Only open lines can be actioned'})
                                                    else {
                                                        return orders.createLine({
                                                            order_id: order.order_id,
                                                            size_id:  line.size_id,
                                                            _qty:     line._qty,
                                                            user_id:  req.user.user_id,
                                                            note:     ` from request line ${_order.line_id}`
                                                        })
                                                        .then(result => {
                                                            if (!result.success) resolve(result)
                                                            else {
                                                                let actions = []
                                                                actions.push(line.update({_status: 3}));
                                                                actions.push(
                                                                    m.stores.request_line_actions.create({
                                                                        request_line_id: _order.line_id,
                                                                        action_line_id:  result.line_id,
                                                                        _action:         'Order',
                                                                        user_id:         req.user.user_id
                                                                    })
                                                                );
                                                                if (result.created) {
                                                                    actions.push(
                                                                        m.stores.order_line_actions.create({
                                                                            order_line_id: result.line_id,
                                                                            action_line_id: _order.line_id,
                                                                            _note: `Created from request line`,
                                                                            user_id: req.user.user_id
                                                                        })
                                                                    );
                                                                };
                                                                Promise.all(actions)
                                                                .then(results => resolve({success: true, message: 'Request line ordered', line_id: result.line_id}))
                                                                .catch(err => reject(err));
                                                            };
                                                        })
                                                        .catch(err => reject(err));
                                                    };
                                                })
                                                .catch(err => reject(err));
                                            })
                                        );
                                    });
                                    return Promise.all(order_actions)
                                    .then(results => resolve({success: true, message: 'Orders processed', results: results}))
                                    .catch(err => reject(err));
                                } else resolve({success: false, message: result.message});
                            })
                            .catch(err => reject(err));
                        })
                    );
                };
                if (_issues.length > 0) {
                    actions.push(
                        new Promise((resolve, reject) => {
                            issues.create(
                                request.user_id_request,
                                req.user.user_id
                            )
                            .then(issue => {
                                if (issue.success) {
                                    return m.stores.issue_lines.count({where: {issue_id: issue.issue_id}})
                                    .then(line_count => {
                                        let issue_actions = [], offset = new Counter;
                                        _issues.forEach(_issue => {
                                            issue_actions.push(
                                                new Promise((resolve, reject) => {
                                                    m.stores.request_lines.findOne({
                                                        where:      {line_id: _issue.line_id},
                                                        attributes: ['line_id', '_status', 'size_id', '_qty']
                                                    })
                                                    .then(line => {
                                                        if     (!line)               resolve({success: false, message: 'Request line not found'})
                                                        else if (line._status !== 2) resolve({success: false, message: 'Only open lines can be actioned'})
                                                        else {
                                                            return issues.createLine({
                                                                serial_id: _issue.serial_id || null,
                                                                stock_id:  _issue.stock_id  || null,
                                                                nsn_id:    _issue.nsn_id    || null,
                                                                issue_id:  issue.issue_id,
                                                                size_id:   line.size_id,
                                                                user_id:   req.user.user_id,
                                                                _qty:      line._qty,
                                                                _line:     Number(line_count) + offset()
                                                            })
                                                            .then(result => {
                                                                if (!result.success) resolve(result)
                                                                else {
                                                                    let actions = [];
                                                                    actions.push(line.update({_status: 3}));
                                                                    actions.push(
                                                                        m.stores.request_line_actions.create({
                                                                            request_line_id: line.line_id,
                                                                            action_line_id:  result.line_id,
                                                                            _action:         'Issue',
                                                                            user_id:         req.user.user_id
                                                                        })
                                                                    );
                                                                    if (result.created) {
                                                                        actions.push(
                                                                            m.stores.notes.create({
                                                                                _id:     result.line_id,
                                                                                _table:  'issue_lines',
                                                                                _note:   `Created from request line ${line.line_id}`,
                                                                                user_id: req.user.user_id,
                                                                                _system: 1
                                                                            })
                                                                        );
                                                                    };
                                                                    Promise.all(actions)
                                                                    .then(results => resolve({success: true, message: 'Request line issued', line_id: result.line_id}))
                                                                    .catch(err => reject(err));
                                                                };
                                                            })
                                                            .catch(err => reject(err));
                                                        };
                                                    })
                                                    .catch(err => reject(err));
                                                })
                                            );
                                        });
                                        return Promise.all(issue_actions)
                                        .then(results => resolve({success: true, message: 'Issues processed', results: results}))
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
                                } else resolve(result);
                            })
                            .catch(err => reject(err));
                        })
                    );
                };
                _declines.forEach(e => {
                    actions.push(
                        m.stores.request_line_actions.create({
                            request_line_id: e.line_id,
                            _action: 'Declined',
                            user_id: req.user.user_id
                        })
                    );
                    actions.push(
                        m.stores.request_lines.update(
                            {_status: 4},
                            {where: {line_id: e.line_id}}
                        )
                    );
                });
                return Promise.all(actions)
                .then(results => {
                    return m.stores.request_lines.count({
                        where: {
                            request_id: request.request_id,
                            _status:    2
                        }
                    })
                    .then(open_lines => {
                        if (open_lines > 0) return res.send({success: true, message: 'Lines actioned'})
                        else {
                            return request.update({_status: 3})
                            .then(result => {
                                if (result) res.send({success: true, message: 'All lines actioned, request closed'})
                                else        res.send({success: true, message: 'Lines actioned, could not close request'});
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
    
    app.delete('/stores/issues/:id',     pm, al('issue_delete',  {allow: true, send: true}), (req, res) => {
        m.stores.issues.findOne({
            where:      {issue_id: req.params.id},
            attributes: ['issue_id', '_status', 'user_id_issue']
        })
        .then(issue => {
            if      (!issue)                                                   res.send({success: false, message: 'Issue not found'})
            else if (!req.allowed && issue.user_id_issue !== req.user.user_id) res.send({success: false, message: 'Permission denied'})
            else if (issue._status !== 1 && issue._status !== 2)               res.send({success: false, message: 'Only requested and approved lines can be cancelled'})
            else {
                return issue.update({_status: 0})
                .then(result => {
                    return m.stores.issue_actions.create({
                        issue_id: issue.issue_id,
                        _action: 'Cancelled',
                        user_id: req.user.user_id
                    })
                    .then(action => res.send({success: true, message: 'Issue cancelled'}))
                    .catch(err => {
                        console.log(err);
                        res.send({success: true, message: `Line cancelled. Error creating action: ${err.message}`});
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.send({success: false, message: `Error updating line: ${err.message}`});
                });
            };
        })
        .catch(err => res.error.send(err, res));
    });

    function approve_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return m.stores.permissions.findOne({
                where: {
                    _permission: 'issue_edit',
                    user_id:     user_id
                },
                attributes: ['_permission']
            })
            .then(permission => {
                if (!permission) resolve({success: false, message: 'Permission denied'})
                else {
                    return m.stores.issues.findOne({
                        where:      {issue_id: line.issue_id},
                        attributes: ['issue_id', '_status']
                    })
                    .then(issue => {
                        if      (!issue)              resolve({success: false, message: 'Issue not found'})
                        else if (issue._status !== 1) resolve({success: false, message: 'This issue is not pending approval'})
                        else {
                            return issue.update({_status: 2})
                            .then(result => {
                                return m.stores.issue_actions.create({
                                    issue_id: issue.issue_id,
                                    _action: 'Approved',
                                    user_id: user_id
                                })
                                .then(action => resolve({success: true, message: 'Line approved'}))
                                .catch(err =>   resolve({success: true, message: `Line approved. Error creating action: ${err.message}`}));
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
    function order_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return m.stores.permissions.findOne({
                where: {
                    _permission: 'order_add',
                    user_id:     user_id
                },
                attributes: ['_permission']
            })
            .then(permission => {
                if (!permission) resolve({success: false, message: 'Permission denied'})
                else {
                    return m.stores.issues.findOne({
                        where:      {issue_id: line.issue_id},
                        attributes: ['issue_id', 'size_id', '_qty', '_status'],
                        include:    [inc.sizes({attributes: ['size_id', '_orderable']})]
                    })
                    .then(issue => {
                        if      (issue._status !== 2)    resolve({success: false, message: 'Only approved orders can be ordered'})
                        else if (!issue.size)            resolve({success: false, message: 'Size not found'})
                        else if (!issue.size._orderable) resolve({success: false, message: 'This size can not be ordered'})
                        else {
                            return m.stores.orders.findOrCreate({
                                where: {
                                    size_id: issue.size_id,
                                    _status: 1
                                },
                                defaults: {
                                    user_id: user_id,
                                    _qty:    issue._qty
                                }
                            })
                            .then(([order, created]) => {
                                if (created) {
                                    return issue.update({_status: 3})
                                    .then(result => {
                                        return m.stores.order_actions.create({
                                            order_id: order.order_id,
                                            _action:  'Created from issue',
                                            issue_id: issue.issue_id,
                                            user_id:  user_id
                                        })
                                        .then(action => {
                                            return m.stores.issue_actions.create({
                                                issue_id: issue.issue_id,
                                                _action:  'Ordered',
                                                order_id: order.order_id,
                                                user_id:  user_id
                                            })
                                            .then(action => resolve({success: true, message: 'Order created'}))
                                            .catch(err => resolve({success: true, message: `Order created. Error creating issue action: ${err.message}`}));
                                        })
                                        .catch(err => resolve({success: true, message: `Order created. Error creating order action: ${err.message}`}));
                                    })
                                    .catch(err => resolve({success: true, message: `Order created. Error updating issue: ${err.message}`}));
                                } else {
                                    return order.increment('_qty', {by: issue._qty})
                                    .then(result => {
                                        return issue.update({_status: 3})
                                        .then(result => {
                                            return m.stores.order_actions.create({
                                                order_id: order.order_id,
                                                _action:  'Created from issue',
                                                issue_id: issue.issue_id,
                                                user_id:  user_id
                                            })
                                            .then(action => {
                                                return m.stores.issue_actions.create({
                                                    issue_id: issue.issue_id,
                                                    _action:  'Ordered',
                                                    order_id: order.order_id,
                                                    user_id:  user_id
                                                })
                                                .then(action => resolve({success: true, message: 'Order incremented'}))
                                                .catch(err => resolve({success: true, message: `Order incremented. Error creating issue action: ${err.message}`}));
                                            })
                                            .catch(err => resolve({success: true, message: `Order incremented. Error creating order action: ${err.message}`}));
                                        })
                                        .catch(err => resolve({success: true, message: `Order incremented. Error updating issue: ${err.message}`}));
                                    })
                                    .catch(err => reject(err));
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
    function issue_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return m.stores.permissions.findOne({
                where: {
                    _permission: 'loancard_add',
                    user_id:     user_id
                },
                attributes: ['_permission']
            })
            .then(permission => {
                if (!permission) resolve({success: false, message: 'Permission denied'})
                else {
                    return m.stores.issues.findOne({
                        where:      {issue_id: line.issue_id},
                        attributes: ['issue_id', '_status'],
                        include:    [
                            inc.sizes({
                                attributes: ['size_id', '_issueable', '_nsns', '_serials'],
                                include:    [
                                    inc.serials({
                                        where:      {serial_id: line.serial_id},
                                        attributes: ['serial_id', 'issue_id']
                                    }),
                                    inc.stocks({
                                        where:      {stock_id: line.stock_id},
                                        attributes: ['stock_id']
                                    }),
                                    inc.nsns({
                                        where:      {nsn_id: line.nsn_id},
                                        attributes: ['nsn_id']
                                    })
                                ]
                            })
                        ]
                    })
                    .then(issue => {
                        console.log(issue);
                        if      (issue._status !== 2  && issue._status !== 3)    resolve({success: false, message: 'Only approved or ordered lines can be issued'})
                        else if (!issue.size)                                    resolve({success: false, message: 'Size not found'})
                        else if (!issue.size._issueable)                         resolve({success: false, message: 'This size is not issueable'})
                        else if (issue.size._nsns     && !line.nsn_id)           resolve({success: false, message: 'No NSN specified'})
                        else if (issue.size._nsns     && !issue.size.nsns[0])    resolve({success: false, message: 'NSN not found'})
                        else if (issue.size._serials  && !line.serial_id)        resolve({success: false, message: 'No serial # specified'})
                        else if (issue.size._serials  && !issue.size.serials[0]) resolve({success: false, message: 'Serial not found'})
                        else if (issue.size.serials[0].issue_id)                 resolve({success: false, message: 'Serial # is already issued'})
                        else if (!issue.size._serials && !line.stock_id)         resolve({success: false, message: 'No stock location specified'})
                        else if (!issue.size._serials && !issue.size.stocks[0])  resolve({success: false, message: 'Stock location not found'})
                        else {
                            loancards.create({
                                user_id_loancard: issue.user_id_issue,
                                user_id:          user_id
                            })
                            .then(loancard => {
                                loancards.createLine({
                                    loancard_id: loancard.loancard_id,
                                    issue_id:    issue.issue_id,
                                    size_id:     issue.size_id,
                                    serial_id:   issue.size.serials[0].serial_id || null,
                                    nsn_id:      issue.size.nsns[0].nsn_id       || null,
                                    _qty:        line._qty                       || 1,
                                    user_id:     user_id
                                })
                                .then(loancard_line => {
                                    m.stores.issue_actions.create({
                                        issue_id:         issue.issue_id,
                                        _action:          'Added to loancard',
                                        serial_id:        issue.size.serials[0].serial_id || null,
                                        stock_id:         issue.size.stocks[0].stock_id   || null,
                                        nsn_id:           issue.size.nsns[0].nsn_id       || null,
                                        loancard_line_id: loancard_line.line_id,
                                        user_id:          user_id
                                    })
                                    .then(action => resolve({success: true, message: 'Line added to loancard'}))
                                    .catch(err =>   resolve({success: true, message: `Line added to loancard. Error creating issue action: ${err.message}`}))
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
    function return_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return m.stores.permissions.findOne({
                where: {
                    _permission: 'loancard_edit',
                    user_id:     user_id
                },
                attributes: ['_permission']
            })
            .then(permission => {
                if (!permission) resolve({success: false, message: 'Permission denied'})
                else {
                    return m.stores.issues.findOne({
                        where: {issue_id: line.issue_id},
                        attributes: ['issue_id', '_status']
                    })
                    .then(issue => {
                        if (issue._status !== 4) resolve({success: false, message: 'Only issued orders can be returned'})
                        else {
                            
                        };
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
};