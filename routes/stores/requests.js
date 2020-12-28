const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    let requests = {}, orders = {}, issues = {},
    promiseResults = require(`${process.env.ROOT}/fn/utils/promise_results`),
    Counter        = require(`${process.env.ROOT}/fn/utils/counter`);
    require(`${process.env.ROOT}/fn/stores/requests`)(m, requests);
    require(`${process.env.ROOT}/fn/stores/orders`)  (m, orders);
    require(`${process.env.ROOT}/fn/stores/issues`)  (m, issues);
    app.get('/stores/requests',                 permissions, allowed('access_requests',     {allow: true}),             (req, res) => res.render('stores/requests/index'));
    app.get('/stores/requests/:id',             permissions, allowed('access_requests',     {allow: true}),             (req, res) => {
        m.stores.requests.findOne({
            where: {request_id: req.params.id},
            attributes: ['requested_for', '_status']
        })
        .then(request => {
            if (request._status && request._status === 1) req.flash('danger', "This request is still in draft, no items on this request will be actioned or considered until the request is marked as 'Complete'")
            if      (!request)                                                   res.error.redirect(new Error('Request not found'), req, res);
            else if (!req.allowed && request.requested_for !== req.user.user_id) res.error.redirect(new Error('Permission denied'), req, res);
            else res.render('stores/requests/show');
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/request_lines/:id',        permissions, allowed('access_request_lines',             {send: true}), (req, res) => {
        m.stores.request_lines.findOne({
            where: {line_id: req.params.id},
            attribute: ['request_id']
        })
        .then(line => {
            if (!line) res.error.redirect(new Error('Request line not found'), req, res);
            else res.redirect(`/stores/requests/${line.request_id}`)
        })
        .catch(err => res.error.send(err, res));
    });
    
    app.get('/stores/get/requests',             permissions, allowed('access_requests',     {allow: true, send: true}), (req, res) => {
        if (!allowed) req.query.requested_for = req.user.user_id;
        m.stores.requests.findAll({
            where: req.query,
            include: [
                inc.request_lines(),
                inc.users({as: 'user_for'}),
                inc.users({as: 'user_by'})
            ]
        })
        .then(requests => res.send({result: true, requests: requests}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/request',              permissions, allowed('access_requests',     {allow: true, send: true}), (req, res) => {
        if (!allowed) req.query.requested_for = req.user.user_id;
        m.stores.requests.findOne({
            where: req.query,
            include: [
                inc.request_lines(),
                inc.users({as: 'user_for'}),
                inc.users({as: 'user_by'})
            ]
        })
        .then(request => res.send({result: true, request: request}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/request_lines',        permissions, allowed('access_request_lines',             {send: true}), (req, res) => {
        m.stores.request_lines.findAll({
            where:      req.query,
            include:    [
                inc.sizes(),
                inc.requests(),
                inc.users()
            ]
        })
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/request_line',         permissions, allowed('access_request_lines',             {send: true}), (req, res) => {
        m.stores.request_lines.findOne({
            where:      req.query,
            include:    [
                inc.sizes(),
                inc.users()
            ]
        })
        .then(request_line => {
            if (request_line) res.send({result: true,  request_line: request_line})
            else              res.send({result: false, message: 'Line not found'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/request_line_actions', permissions, allowed('access_request_lines',             {send: true}), (req, res) => {
        m.stores.request_line_actions.findAll({
            where:      req.query,
            include:    [
                inc.request_lines({as: 'request_line'}),
                inc.users()
            ]
        })
        .then(request_line_actions => res.send({result: true, request_line_actions: request_line_actions}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/request_lines/:id',    permissions, allowed('access_request_lines',             {send: true}), (req, res) => {
        m.stores.request_lines.findAll({
            where: req.query,
            include: [
                inc.sizes(),
                inc.requests({
                    where: {requested_for: req.params.id},
                    required: true
                })
            ]
        })
        .then(lines => res.send({result: true, request_lines: lines}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/requests',                permissions, allowed('request_add',                      {send: true}), (req, res) => {
        requests.create({
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
    app.post('/stores/request_lines',           permissions, allowed('request_line_add',                 {send: true}), (req, res) => {
        requests.createLine({
            line: req.body.line,
            user_id: req.user.user_id
        })
        .then(line_id => res.send({result: true, message: `Item added: ${line_id}`}))
        .catch(err => res.error.send(err, res))
    });//duplicated below for add size modal
    app.post('/stores/requests_lines',          permissions, allowed('request_line_add',                 {send: true}), (req, res) => {
        requests.createLine({
            line: req.body.line,
            user_id: req.user.user_id
        })
        .then(line_id => res.send({result: true, message: `Item added: ${line_id}`}))
        .catch(err => res.error.send(err, res))
    });
    
    app.put('/stores/requests/:id',             permissions, allowed('request_edit',        {allow: true, send: true}), (req, res) => {
        m.stores.requests.findOne({
            where: {request_id: req.params.id},
            include: [inc.request_lines({where: {_status: 1}, attributes: ['line_id']})],
            attributes: ['requested_for', '_status', 'request_id']
        })
        .then(request => {
            if (!request) {
                res.error.send('Request not found', res);
            } else if (!req.allowed && req.user.user_id !== request.requested_for) {
                res.error.send('Permission denied', res);
            } else if (request._status !== 1) {
                res.error.send('Request must be in draft to be completed', res);
            } else if (!request.lines || request.lines.length === 0) {
                res.error.send('A request must have at least one open line before you can complete it', res);
            } else {
                let actions = [];
                actions.push(request.update({_status: 2}));
                actions.push(
                    m.stores.request_lines.update(
                        {_status: 2},
                        {where:{
                            request_id: request.request_id,
                            _status: 1
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
                .then(result => res.send({result: true, message: `Request completed`}))
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/request_lines/:id',        permissions, allowed('request_line_edit',                {send: true}), (req, res) => {
        m.stores.requests.findOne({
            where: { request_id: req.params.id },
            attributes: ['request_id', 'requested_for' , '_status']
        })
        .then(request => {
            if      (request.requested_for === req.user.user_id) res.send({result: false, message: 'You can not approve requests for yourself'})
            else if (request._status !== 2)                      res.send({result: false, message: 'This request is not open'})
            else {
                let actions = [],
                    _cancels  = req.body.actions.filter(e => e._status === '0'),
                    _issues   = req.body.actions.filter(e => e._status === '3' && e._action === 'Issue'),
                    _orders   = req.body.actions.filter(e => e._status === '3' && e._action === 'Order'),
                    _declines = req.body.actions.filter(e => e._status === '4');
                _cancels.forEach(e => {
                    actions.push(
                        m.stores.request_line_actions.create({
                            request_line_id: e.line_id,
                            _action: 'Cancelled',
                            user_id: req.user.user_id
                        })
                    );
                    actions.push(
                        m.stores.request_lines.update(
                            {_status: 0},
                            {where: {line_id: e.line_id}}
                        )
                    );
                });
                if (_orders.length > 0) {
                    actions.push(
                        new Promise((resolve, reject) => {
                            orders.create(
                                request.requested_for,
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
                                                                        m.stores.notes.create({
                                                                            _id: result.line_id,
                                                                            _table: 'order_lines',
                                                                            _note: `Created from request line ${_order.line_id}`,
                                                                            user_id: req.user.user_id,
                                                                            _system: 1
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
                                request.requested_for,
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
                        if (open_lines > 0) return res.send({result: true, message: 'Lines actioned'})
                        else {
                            return request.update({_status: 3})
                            .then(result => {
                                if (result) res.send({result: true, message: 'All lines actioned, request closed'})
                                else        res.send({result: true, message: 'Lines actioned, could not close request'});
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
    
    app.delete('/stores/requests/:id',          permissions, allowed('request_delete',      {allow: true, send: true}), (req, res) => {
        m.stores.requests.findOne({
            where: {request_id: req.params.id},
            attributes: ['request_id', '_status', 'requested_for'],
            include: [inc.request_lines({attributes: ['line_id'], where: {_status: 1}})]
        })
        .then(request => {
            if (!request) return res.error.send('Request not found', res)
            else if (!allowed && request.requested_for !== req.user.user_id) return res.error.send('Permission denied', res)
            else if (request._status !== 1) return res.error.send('Only draft requests can be cancelled', res)
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
                        m.stores.notes.create({
                            _id: line.line_id,
                            _table: 'request_lines',
                            _note: 'Request cancelled',
                            _system: 1,
                            user_id: req.user.user_id
                        })
                    )
                });
                actions.push(
                    request.update({_status: 0})
                );
                Promise.allSettled(actions)
                .then(result => {
                    if (promiseResults(result)) res.send({result: true, message: 'Request cancelled'})
                    else res.send({result: true, message: 'Some actions have failed'});
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/request_lines/:id',     permissions, allowed('request_line_delete', {allow: true, send: true}), (req, res) => {
        m.stores.request_lines.findOne({
            where: {line_id: req.params.id},
            attributes: ['line_id', '_status'],
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
                let actions = [];
                actions.push(line.update({_status: 0}))
                actions.push(
                    m.stores.notes.create({
                        _id: line.line_id,
                        _table: 'request_lines',
                        _note: 'Cancelled',
                        _system: 1,
                        user_id: req.user.user_id
                    })
                );
                return Promise.allSettled(actions)
                .then(result => {
                    if (promiseResults(result)) res.send({result: true, message: 'Line cancelled'})
                    else res.send({result: true, message: 'Some actions have failed'});
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
};    