const op = require('sequelize').Op;
module.exports = (app, al, inc, pm, m) => {
    let requests = {}, orders = {}, issues = {},
    promiseResults = require('../functions/promise_results'),
    Counter        = require('../functions/counter');
    require('./functions/requests')(m, requests);
    require('./functions/orders')  (m, orders);
    require('./functions/issues')  (m, issues);
    app.get('/stores/requests',                 pm, al('access_requests',     {allow: true}),             (req, res) => res.render('stores/requests/index'));
    app.get('/stores/requests/:id',             pm, al('access_requests',     {allow: true}),             (req, res) => {
        m.stores.requests.findOne({
            where: {request_id: req.params.id},
            attributes: ['user_id_request', '_status']
        })
        .then(request => {
            if      (!request)                                                     res.error.redirect(new Error('Request not found'), req, res)
            else if (!req.allowed && request.user_id_request !== req.user.user_id) res.error.redirect(new Error('Permission denied'), req, res)
            else {
                if (request._status === 1) req.flash('danger', "This request is still in draft, no items on this request will be actioned or considered until the request is marked as 'Complete'");
                res.render('stores/requests/show');
            };
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/request_lines/:id',        pm, al('access_request_lines',             {send: true}), (req, res) => {
        m.stores.request_lines.findOne({
            where: {line_id: req.params.id},
            attribute: ['request_id']
        })
        .then(line => {
            if (!line) {
                req.flash('danger', 'Request line not found');
                res.redirect('/stores/requests');
            } else res.redirect(`/stores/requests/${line.request_id}`);
        })
        .catch(err => res.error.send(err, res));
    });
    
    app.get('/stores/count/requests',           pm, al('access_requests',                  {send: true}), (req, res) => {
        m.stores.requests.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/requests',             pm, al('access_requests',     {allow: true, send: true}), (req, res) => {
        if (!req.allowed) req.query.user_id_request = req.user.user_id;
        m.stores.requests.findAll({
            where: req.query,
            include: [
                inc.request_lines(),
                inc.users({as: 'user_request'}),
                inc.users({as: 'user'})
            ]
        })
        .then(requests => res.send({success: true, result: requests}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/request',              pm, al('access_requests',     {allow: true, send: true}), (req, res) => {
        if (!req.allowed) req.query.user_id_request = req.user.user_id;
        m.stores.requests.findOne({
            where: req.query,
            include: [
                inc.users({as: 'user_request'}),
                inc.users({as: 'user'})
            ]
        })
        .then(request => {
            if (request) res.send({success: true,  result: request})
            else         res.send({success: false, message: 'Request not Found'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/request_lines',        pm, al('access_request_lines',             {send: true}), (req, res) => {
        m.stores.request_lines.findAll({
            where:      req.query,
            include:    [
                inc.sizes(),
                inc.requests(),
                inc.users()
            ]
        })
        .then(lines => res.send({success: true, result: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/request_line',         pm, al('access_request_lines',             {send: true}), (req, res) => {
        m.stores.request_lines.findOne({
            where:      req.query,
            include:    [
                inc.sizes(),
                inc.users()
            ]
        })
        .then(line => {
            if (line) res.send({success: true,  result: line})
            else      res.send({success: false, message: 'Line not found'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/request_line_actions', pm, al('access_request_lines',             {send: true}), (req, res) => {
        m.stores.request_line_actions.findAll({
            where:      req.query,
            include:    [
                inc.request_lines({as: 'request_line'}),
                inc.users()
            ]
        })
        .then(actions => res.send({success: true, result: actions}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/request_lines/:id',    pm, al('access_request_lines',             {send: true}), (req, res) => {
        m.stores.request_lines.findAll({
            where: req.query,
            include: [
                inc.sizes(),
                inc.requests({
                    where: {user_id_request: req.params.id},
                    required: true
                })
            ]
        })
        .then(lines => res.send({success: true, result: lines}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/requests',                pm, al('request_add',                      {send: true}), (req, res) => {
        requests.create({
            user_id_request: req.body.user_id_request,
            user_id:       req.user.user_id
        })
        .then(result => {
            if (result.result) {
                if (result.created) res.send({success: true, message: `Request raised: ${result.request_id}`})
                else                res.send({success: true, message: `Request already in draft for this user: ${result.request_id}`});
            } else res.send(result);
        })
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/request_lines',           pm, al('request_line_add',                 {send: true}), (req, res) => {
        requests.createLine({
            line: req.body.line,
            user_id: req.user.user_id
        })
        .then(line_id => res.send({success: true, message: 'Item added'}))
        .catch(err => res.error.send(err, res))
    });
    
    app.put('/stores/requests/:id',             pm, al('request_edit',        {allow: true, send: true}), (req, res) => {
        m.stores.requests.findOne({
            where:      {request_id: req.params.id},
            attributes: ['user_id_request', '_status', 'request_id'],
            include:    [inc.request_lines({where: {_status: 1}, attributes: ['line_id']})]
        })
        .then(request => {
            if      (!request)                                                   res.send({success: false, message: 'Request not found'});
            else if (!req.allowed && req.user.user_id !== request.user_id_request) res.send({success: false, message: 'Permission denied'});
            else if (request._status !== 1)                                      res.send({success: false, message: 'Request must be in draft to be completed'});
            else if (!request.lines || request.lines.length === 0)               res.send({success: false, message: 'A request must have at least one open line before you can complete it'});
            else {
                let actions = [];
                actions.push(request.update({_status: 2}));
                request.lines.forEach(line => {
                    m.stores.request_line_actions.create({
                        request_line_id: line.line_id,
                        _action: 'Request completed',
                        user_id: req.user.user_id
                    })
                });
                actions.push(
                    m.stores.request_lines.update(
                        {_status: 2},
                        {where:{
                            request_id: request.request_id,
                            _status:    1
                        }}
                    )
                );
                actions.push(
                    m.stores.notes.create({
                        _id:     req.params.id,
                        _table:  'requests',
                        _note:   'Completed',
                        _system: 1,
                        user_id: req.user.user_id
                    })
                );
                return Promise.all(actions)
                .then(result => res.send({success: true, message: `Request completed`}))
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/request_lines/:id',        pm, al('request_line_edit',                {send: true}), (req, res) => {
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
    
    app.delete('/stores/requests/:id',          pm, al('request_delete',      {allow: true, send: true}), (req, res) => {
        m.stores.requests.findOne({
            where:      {request_id: req.params.id},
            attributes: ['request_id', '_status', 'user_id_request'],
            include:    [inc.request_lines({attributes: ['line_id'], where: {_status: 1}})]
        })
        .then(request => {
            if      (!request)                                               res.send({success: false, message: 'Request not found'})
            else if (!req.allowed && request.user_id_request !== req.user.user_id) res.send({success: false, message: 'Permission denied'})
            else if (request._status !== 1)                                  res.send({success: false, message: 'Only draft requests can be cancelled'})
            else {
                let actions = [];
                actions.push(
                    m.stores.request_lines.update(
                        {_status: 0},
                        {where: {request_id: request.request_id}}
                    )
                );
                request.lines.forEach(line => {
                    actions.push(
                        m.stores.request_line_actions.create({
                            request_line_id: line.line_id,
                            _action: 'Request cancelled',
                            user_id: req.user.user_id
                        })
                    )
                });
                actions.push(request.update({_status: 0}));
                Promise.allSettled(actions)
                .then(result => {
                    if (promiseResults(result)) res.send({success: true, message: 'Request cancelled'})
                    else                        res.send({success: true, message: 'Some actions have failed'});
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/request_lines/:id',     pm, al('request_line_delete', {allow: true, send: true}), (req, res) => {
        m.stores.request_lines.findOne({
            where: {line_id: req.params.id},
            attributes: ['line_id', '_status'],
            include: [inc.requests({attributes:['_status', 'user_id_request']})]
        })
        .then(line => {
            if      (!req.allowed && line.request.user_id_request !== req.user.user_id) res.send({success: false, message: 'Permission denied'});
            else if (line.request._status !== 1)                                        res.send({success: false, message: 'Lines can only be cancelled whilst a request is in draft'});
            else if (line._status === 0)                                                res.send({success: false, message: 'This line has already been cancelled'});
            else if (line._status !== 1)                                                res.send({success: false, message: 'Only pending lines can be cancelled'});
            else {
                let actions = [];
                actions.push(line.update({_status: 0}))
                actions.push(
                    m.stores.request_line_actions.create({
                        request_line_id: line.line_id,
                        _action: 'Cancelled',
                        user_id: req.user.user_id
                    })
                );
                return Promise.allSettled(actions)
                .then(result => {
                    if (promiseResults(result)) res.send({success: true, message: 'Line cancelled'})
                    else                        res.send({success: true, message: 'Some actions have failed'});
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
};    