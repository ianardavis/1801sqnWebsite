const op = require('sequelize').Op;
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //INDEX
    app.get('/stores/requests',             isLoggedIn, allowed('access_requests',      {allow: true}),             (req, res) => res.render('stores/requests/index'));
    //SHOW
    app.get('/stores/requests/:id',         isLoggedIn, allowed('access_requests',      {allow: true}),             (req, res) => {
        fn.getOne(
            m.requests,
            {request_id: req.params.id},
            {include: [
                inc.users({as: '_for'}),
                inc.users({as: '_by'})
        ]})
        .then(request => {
            if (req.allowed || request._for.user_id === req.user.user_id) {
                res.render('stores/requests/show', {
                    request: request,
                    notes:   {table: 'requests', id: request.request_id},
                    show_tab: req.query.tab || 'details'
                });
            } else {
                req.flash('danger', 'Permission denied')
                res.redirect('/stores/requests');
            };
        })
        .catch(err => fn.error(err, '/stores/requests', req, res));
    });
    //ASYNC GET
    app.get('/stores/getrequests',          isLoggedIn, allowed('access_requests',      {allow: true, send: true}), (req, res) => {
        if (!allowed) req.query.requested_for = req.user.user_id;
        fn.getAllWhere(
            m.requests,
            req.query,
            {include: [
                inc.request_lines(),
                inc.users({as: '_for'}),
                inc.users({as: '_by'})
        ]})
        .then(requests => res.send({result: true, requests: requests}))
        .catch(err => fn.send_error(err, res));
    });
    app.get('/stores/request_lines',        isLoggedIn, allowed('access_request_lines', {send: true}),              (req, res) => {
        fn.getAllWhere(
            m.request_lines,
            req.query,
            {include: [
                inc.sizes(),
                inc.users(),
                inc.requests()
        ]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => fn.send_error(err, res));
    });
    app.get('/stores/request_lines/:id',    isLoggedIn, allowed('access_request_lines', {send: true}),              (req, res) => {
        fn.getAllWhere(
            m.request_lines,
            req.query,
            {include:[
                inc.sizes(),
                inc.users(),
                inc.requests({
                    where: {requested_for: req.params.id},
                    required: true
        })]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => fn.send_error(err, res));
    });

    //POST
    app.post('/stores/requests',            isLoggedIn, allowed('request_add',          {send: true}),              (req, res) => {
        fn.createRequest({
            requested_for: req.body.requested_for,
            user_id:       req.user.user_id
        })
        .then(request_id => {
            let message = 'Request raised: ';
            if (!result.created) message = 'There is already a request open for this user: ';
            res.send({result: true, message: message + request_id})
        })
        .catch(err => fn.send_error(err, res));
    });
    app.post('/stores/request_lines/:id',   isLoggedIn, allowed('request_line_add',     {send: true}),              (req, res) => {
        req.body.line.request_id = req.params.id;
        req.body.line.user_id  = req.user.user_id;
        fn.createRequestLine(req.body.line)
        .then(line_id => res.send({result: true, message: 'Item added: ' + line_id}))
        .catch(err => fn.send_error(err, res))
    });

    //COMPLETE
    app.put('/stores/requests/:id',         isLoggedIn, allowed('request_edit',         {send: true, allow: true}), (req, res) => {
        fn.getOne(
            m.requests,
            {request_id: req.params.id},
            {
                include: [inc.request_lines({where: {_status: {[op.not]: 'Cancelled'}}})],
                nullOK:  true
            }
        )
        .then(request => {
            if (!request.lines || request.lines.length === 0) {
                fn.send_error('A request must have at least one open line before you can complete it', res);
            } else if (request._complete) {
                fn.send_error('Request is already complete', res);
            } else if (!req.allowed && req.user.user_id !== request.requested_for) {
                fn.send_error('Permission denied', res);
            } else {
                let actions = [];
                actions.push(
                    fn.update(
                        m.requests,
                        {_complete: 1},
                        {request_id: req.params.id}
                    )
                );
                actions.push(
                    fn.update(
                        m.request_lines,
                        {_status: 'Open'},
                        {request_id: req.params.id}
                    )
                );
                Promise.allSettled(actions)
                .then(_result => {
                    if (fn.promise_results(_result)) {
                        fn.createNote(
                            {
                                table:  'requests',
                                note:   'Completed',
                                id:      req.params.id,
                                user_id: req.user.user_id,
                                system:  true
                            }
                        )
                        .then(note => res.send({result: true, message: 'Request marked as complete'}))
                        .catch(err => fn.send_error(err, res));
                    } else fn.send_error('Some actions have failed', res)
                })
                .catch(err => fn.send_error(err, res));
            };
        })
        .catch(err => fn.send_error(err, res));
    });
    //APPROVAL
    app.put('/stores/request_lines/:id',    isLoggedIn, allowed('request_edit',         {send: true}),              (req, res) => {
        fn.getOne(
            m.requests,
            {request_id: req.params.id},
            {include: [
                inc.users({as: '_for'})
        ]})
        .then(request => {
            if (request.requested_for === req.user.user_id) {
                fn.send_error('You can not approve requests for yourself', result);
            } else {
                let orders = [], issues = [], actions = [];
                for (let [lineID, line] of Object.entries(req.body.actions)) {
                    line.line_id = Number(String(lineID).replace('line_id', ''));
                    if (line._action === 'Order') orders.push(line)
                    else if (line._action === 'Issue') {
                        line.offset = issues.length;
                        issues.push(line);
                    } else if (line._status === 'Declined') {
                        actions.push(
                            fn.update(
                                m.request_lines,
                                {
                                    _status: 'Declined',
                                    _date:   Date.now()
                                },
                                {line_id: line.line_id}
                            )
                        );
                        actions.push(
                            fn.createNote({
                                id:     request.request_id,
                                table:  'request_lines',
                                note:   'Line ' + line.line_id + ' declined',
                                user_id: req.user.user_id,
                                system:  true
                            })
                        );
                    };
                };
                if (orders.length > 0) {
                    actions.push(
                        fn.createOrder({
                            ordered_for: request.requested_for,
                            user_id:     req.user.user_id
                        })
                    );
                };
                if (issues.length > 0) {
                    actions.push(
                        fn.createIssue({
                            issued_to: request.requested_for,
                            user_id:   req.user.user_id
                        })
                    );
                };
                Promise.allSettled(actions)
                .then(results => {
                    actions = [];
                    if (issues.length > 0) {
                        let issue_id = results.filter(e => e.value.hasOwnProperty('issue_id'))[0].value.issue_id;
                        if (issue_id) {
                            actions.push(
                                issue_request_lines(
                                    issue_id,
                                    issues,
                                    req.user.user_id
                                )
                            )
                        };
                    };
                    if (orders.length > 0) {
                        let order_id = results.filter(e => e.value.hasOwnProperty('order_id'))[0].value.order_id;
                        if (order_id) {
                            orders.forEach(line => {
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
                        fn.getAllWhere(
                            m.request_lines,
                            {
                                request_id: req.params.id,
                                _status:    'Open'
                            },
                            {nullOK: true}
                        )
                        .then(open_lines => {
                            if (open_lines && open_lines.length > 0) {
                                if (fn.promise_results(results)) res.send({result: true, message: 'Lines actioned'});
                                else fn.send_error('Some actions failed', res);
                            } else {
                                fn.update(
                                    m.requests,
                                    {_closed: 1},
                                    {request_id: req.params.id}
                                )
                                .then(_result => {
                                    if (fn.promise_results(results)) res.send({result: true, message: 'Lines actioned, request closed'});
                                    else fn.send_error('Some actions failed', res);
                                })
                                .catch(err => fn.send_error(err, res));
                            };
                        })
                        .catch(err => fn.send_error(err, res));
                    })
                    .catch(err => fn.send_error(err, res));
                })
                .catch(err => fn.send_error(err, res));
            };
        });
    });
    function order_request_line  (order_id, line_id, user_id) {
        return new Promise((resolve, reject) => {
            fn.getOne(
                m.request_lines,
                {line_id: line_id}
            )
            .then(line => {
                fn.create(
                    m.order_lines,
                    {
                        order_id: order_id,
                        size_id:  line.size_id,
                        _qty:     line._qty,
                        user_id:  user_id
                    }
                )
                .then(new_line => {
                    fn.update(
                        m.request_lines,
                        {
                            _status: 'Approved',
                            _action: 'Order',
                            _id:     new_line.line_id,
                            _date:   Date.now(),
                            user_id: user_id
                        },
                        {line_id: line_id}
                    )
                    .then(result => resolve(new_line.line_id))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function issue_request_lines (issue_id, lines, user_id) {
        return new Promise((resolve, reject) => {
            fn.getAllWhere(
                m.issue_lines,
                {issue_id: issue_id},
                {nullOK: true}
            )
            .then(issue_lines => {
                let actions = [];
                lines.forEach(line => {
                    line._line = issue_lines.length + line.offset + 1;
                    actions.push(issue_request_line(issue_id, line, user_id));
                });
                Promise.allSettled(actions)
                .then(results => resolve(fn.promise_results(results)))
                .catch(err => reject(err))
            })
            .catch(err => reject(err));
        });
    };
    function issue_request_line  (issue_id, line, user_id) {
        return new Promise((resolve, reject) => {
            fn.getOne(
                m.request_lines,
                {line_id: line.line_id}
            )
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
                fn.createIssueLine(_line)
                .then(result => {
                    fn.update(
                        m.request_lines,
                        {
                            _status: 'Approved',
                            _action: 'Issue',
                            _id:     result.line_id,
                            _date:   Date.now(),
                            user_id: user_id
                        },
                        {line_id: line.line_id}
                    )
                    .then(result => resolve(result.line_id))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    //DELETE
    app.delete('/stores/request_lines/:id', isLoggedIn, allowed('request_line_delete',  {send: true}),              (req, res) => {
        fn.delete(
            'request_lines',
            {line_id: req.params.id}
        )
        .then(result => res.send({result: true, message: 'Line deleted'}))
        .catch(err => fn.send_error(err, res));
    });
    app.delete('/stores/requests/:id',      isLoggedIn, allowed('request_delete',       {send: true}),              (req, res) => {
        fn.delete(
            'request_lines',
            {request_id: req.params.id},
            true
        )
        .then(result => {
            fn.delete(
                'requests',
                {request_id: req.params.id}
            )
            .then(result => res.send({result: true, message: 'Request deleted'}))
            .catch(err => fn.send_error(err, res));
        })
        .catch(err => fn.send_error(err, res));
    });
};