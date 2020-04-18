const op = require('sequelize').Op;

module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //INDEX
    app.get('/stores/requests', isLoggedIn, allowed('access_requests', {allow: true}), (req, res) => res.render('stores/requests/index'));
    //NEW
    app.get('/stores/requests/new', isLoggedIn, allowed('request_add', {allow: true}), (req, res) => {
        if (req.query.user) {
            if (req.allowed || Number(req.query.user) === req.user.user_id) {
                fn.getOne(
                    m.users,
                    {user_id: req.query.user},
                    {include: [m.ranks]}
                )
                .then(user => {
                    if (user.status_id === 1 || user.status_id === 2) res.render('stores/requests/new', {user: user}); 
                    else {
                        req.flash('danger', 'Requests can only be made for current users')
                        res.redirect('/stores/users/' + req.query.user);
                    };
                })
                .catch(err => fn.error(err, '/stores/users' + req.query.user, req, res));
            } else {
                req.flash('danger', 'Permission Denied!');
                res.redirect('/stores/users/' + req.query.user);
            };
        } else {
            req.flash('danger', 'No user specified!');
            res.redirect('/stores/users');
        };
    });
    //SHOW
    app.get('/stores/requests/:id', isLoggedIn, allowed('access_requests', {allow: true}), (req, res) => {
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
                req.flash('danger', 'Permission Denied!')
                res.redirect('/stores/requests');
            };
        })
        .catch(err => fn.error(err, '/stores/requests', req, res));
    });
    //ASYNC GET
    app.get('/stores/getrequests', isLoggedIn, allowed('access_requests', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.requests,
            req.query,
            {include: [
                inc.request_lines(),
                inc.users({as: '_for'}),
                inc.users({as: '_by'})
        ]})
        .then(requests => res.send({result: true, requests: requests}))
        .catch(err => fn.send_error(err.message, res));
    });
    app.get('/stores/getrequestlines', isLoggedIn, allowed('access_request_lines', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.request_lines,
            req.query,
            {include: [
                inc.sizes(),
                inc.users(),
                inc.requests()
        ]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => fn.send_error(err.message, res));
    });
    app.get('/stores/getrequestlinesbyuser/:id', isLoggedIn, allowed('access_request_lines', {send: true}), (req, res) => {
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
        .catch(err => fn.send_error(err.message, res));
    });

    //POST
    app.post('/stores/requests', isLoggedIn, allowed('request_add', {allow: true}), (req, res) => {
        if (req.allowed || Number(req.body.requested_for) === req.user.user_id) {
            if (req.body.selected) {
                fn.createRequest(
                    req.body.requested_for,
                    req.body.selected,
                    req.user.user_id
                )
                .then(request_id => {
                    req.flash('success', 'Request added');
                    res.redirect('/stores/users/' + req.body.requested_for);
                })
                .catch(err => fn.error(err, '/stores/users/' + req.body.requested_for, req, res));
            } else {
                req.flash('info', 'No items selected!');
                res.redirect('/stores/users');
            };
        } else {
            req.flash('danger', 'Permission Denied!');
            res.redirect('/stores');
        };
    });

    //APPROVAL
    app.put('/stores/requests/:id/approval', isLoggedIn, allowed('request_edit', {send: true}), (req, res) => {
        if (req.body.selected) {
            fn.getOne(m.requests, {request_id: req.params.id}, {include: [inc.users({as: '_for'})]})
            .then(request => {
                let actions = [];
                if (request.requested_for === req.user.user_id) {
                    req.flash('danger', 'You can not approve requests for yourself');
                    res.redirect('/stores/requests/' + req.params.id);
                } else if (req.body.action === 'cancel') {
                    req.body.selected.forEach(line_id => {
                        actions.push(
                            fn.update(
                                m.request_lines,
                                {
                                    _status: 'Declined',
                                    _date: Date.now(),
                                    user_id: req.user.user_id
                                },
                                {line_id: line_id}
                            )
                        )
                    })
                    Promise.allSettled(actions)
                    .then(results => {
                        req.flash('success', 'Lines cancelled');
                        res.redirect('/stores/requests/' + req.params.id);
                    })
                    .catch(err => fn.error(err, '/stores/requests/' + req.params.id, req, res));
                } else if (req.body.action === 'order') {
                    req.body.selected.forEach(line_id => {
                        actions.push(
                            fn.getOne(
                                m.request_lines,
                                {line_id: line_id},
                                {include: [inc.sizes()]}
                            )
                        )
                    });
                    Promise.allSettled(actions)
                    .then(results => {
                        let items = [];
                        results.forEach(result => {
                            let line = result.value;
                            let new_item = {};
                            new_item['description'] = line.size.item._description;
                            new_item['size'] = line.size._size;
                            new_item['size_id'] = line.size_id;
                            new_item['qty'] = line._qty;
                            new_item['request_line_id'] = line.line_id;
                            items.push(new_item);
                        });
                        res.render('stores/orders/new', {user: request._for, items: items})
                    })
                    .catch(err => fn.error(err, '/stores/requests/' + req.params.id, req, res));
                } else if (req.body.action === 'issue') {
                    req.body.selected.forEach(line_id => {
                        actions.push(
                            fn.getOne(
                                m.request_lines,
                                {line_id: line_id},
                                {include: [inc.sizes({stock: true, nsns: true, serials: true})]}
                            )
                        )
                    });
                    Promise.allSettled(actions)
                    .then(results => {
                        let items = [];
                        results.forEach(line => {
                            if (line.value.size.stocks) {
                                let new_item = {};
                                new_item['description'] = line.value.size.item._description;
                                new_item['size'] = line.value.size._size;
                                new_item['size_id'] = line.value.size_id;
                                new_item['qty'] = line.value._qty;
                                new_item['request_line_id'] = line.value.line_id;
                                if (line.value.size.serials.length > 0) {
                                    new_item['serials'] = line.value.size.serials;
                                };
                                new_item['nsns'] = line.value.size.nsns;
                                let _stock = [];
                                line.value.size.stocks.forEach(stock => {
                                    _stock.push({stock_id: stock.stock_id, _location: stock.location._location, qty: stock._qty})
                                });
                                new_item['stocks'] = _stock;
                                items.push(new_item);
                            };
                        });
                        res.render('stores/issues/new', {user: request._for, items: items})
                    })
                    .catch(err => fn.error(err, '/stores/requests/' + req.params.id, req, res));
                } else {
                    req.flash('danger', 'Invalid request');
                    res.redirect('/stores/requests/' + req.params.id);
                };
            });
        } else {
            req.flash('info', 'No lines selected');
            res.redirect('/stores/requests/' + req.params.id);
        };
    });
    //CLOSE
    app.put('/stores/requests/:id/close', isLoggedIn, allowed('request_edit', {send: true}), (req, res) => {
        let actions = [];
        actions.push(
            fn.update(
                m.request_lines,
                {
                    _status: 'Declined',
                    _date: Date.now(),
                    user_id: req.user.user_id
                },
                {
                    request_id: req.params.id,
                    _status: 'Pending'
                }
            )
        );
        actions.push(
            fn.create(
                m.notes,
                {
                    _table:  'requests',
                    _id:     req.params.id,
                    _note:   'Request closed',
                    _system: true,
                    _date:   Date.now(),
                    user_id: req.user.user_id
                }
            )
        )
        actions.push(
            fn.update(
                m.requests,
                {_complete: true},
                {request_id: req.params.id}
            )
        )
        Promise.allSettled(actions)
        .then(result => {
            req.flash('success', 'Request closed');
            res.redirect('/stores/requests/' + req.params.id);
        })
        .catch(err => fn.error(err, '/stores/requests/' + req.params.id, req, res));
    });

    //DELETE
    app.delete('/stores/requests/:id', isLoggedIn, allowed('request_delete', {send: true}), (req, res) => {
        fn.delete(
            'requests',
            {request_id: req.params.id},
            {hasLines: true}
        )
        .then(result => {
            req.flash(result.success, result.message);
            res.redirect('/stores/requests');
        })
        .catch(err => fn.error(err, '/stores/requests', req, res));
    });
};