const op = require('sequelize').Op;

module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //New Form
    app.get('/stores/requests/new', isLoggedIn, allowed('request_add', false), (req, res) => {
        if (req.query.user) {
            if (req.allowed || Number(req.query.user) === req.user.user_id) {
                fn.getOne(
                    m.users,
                    {user_id: req.query.user},
                    {include: [m.ranks]}
                )
                .then(user => {
                    if (user.status_id === 1) res.render('stores/requests/new', {user: user}); 
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

    //New Logic
    app.post('/stores/requests', isLoggedIn, allowed('request_add', false), (req, res) => {
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

    //delete
    app.delete('/stores/requests/:id', isLoggedIn, allowed('request_delete'), (req, res) => {
        if (req.query.user) {
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
        };
    });

    //Approve/Decline
    app.put('/stores/requests/:id', isLoggedIn, allowed('request_edit'), (req, res) => {
        console.log(req.body.action);
        console.log(req.body.selected);
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
                                    _stock.push({stock_id: stock.stock_id, _location: stock.location._location})
                                });
                                new_item['stocks'] = _stock;
                                items.push(new_item);
                            };

                        });
                        console.log(items);
                        res.render('stores/orders/new', {user: request._for, items: items})
                        // res.redirect('/stores/requests/' + req.params.id);
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
                        console.log(results);
                        res.redirect('/stores/requests/' + req.params.id);
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
    app.put('/stores/requests/:id/approval', isLoggedIn, allowed('request_edit'), (req, res) => {
        fn.processRequests(
            req.body,
            req.user.user_id
        )
        .then(noNSNs => {
            noNSNs.forEach(line_id => req.flash('danger', 'Can not issue line ' + line_id + ', no NSNs available'));
            req.flash('success', 'Requests processed')
            res.redirect('/stores/requests');
        })
        .catch(err => fn.error(err, '/stores/requests', req, res));
    });

    //Index
    app.get('/stores/requests', isLoggedIn, allowed('access_requests', false), (req, res) => {
        let where = {}, query = {};
        query.complete = Number(req.query.complete) || 2
        if      (query.complete === 2) where._complete = 0;
        else if (query.complete === 3) where._complete = 1;
        if (req.allowed === false) where.requested_for = req.user.user_id;
        fn.getAllWhere(
            m.requests,
            where,
            {
                include: [
                    inc.request_lines(),
                    inc.users({as: '_for'})
                ]
            }
        )
        .then(requests => {
            res.render('stores/requests/index',{
                requests: requests,
                query:    query
            });
        })
        .catch(err => fn.error(err, '/stores', req, res));
    });

    //Show
    app.get('/stores/requests/:id', isLoggedIn, allowed('request_edit', false), (req, res) => {
        fn.getOne(
            m.requests,
            {request_id: req.params.id},
            {
                include: [
                    inc.request_lines({include: [inc.sizes({stock: true, nsns: true}), inc.users()]}),
                    inc.users({as: '_for'}),
                    inc.users({as: '_by'})
                ]
            }
        )
        .then(request => {
            if (req.allowed || request._for.user_id === req.user.user_id) {
                fn.getNotes('requests', req.params.id, req)
                .then(notes => {
                    res.render('stores/requests/show', 
                        {
                            request: request,
                            notes:   notes,
                            query:   req.query
                        }
                    );
                });
            } else {
                req.flash('danger', 'Permission Denied!')
                res.redirect('/stores/requests');
            };
        })
        .catch(err => fn.error(err, '/stores/requests', req, res));
    });
};