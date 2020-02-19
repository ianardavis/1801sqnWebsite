const op = require('sequelize').Op;

module.exports = (app, allowed, fn, isLoggedIn, m) => {
    //New Form
    app.get('/stores/requests/new', isLoggedIn, allowed('requests_add', false), (req, res) => {
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
    app.post('/stores/requests', isLoggedIn, allowed('requests_add', false), (req, res) => {
        if (req.allowed || Number(req.body.requested_for) === req.user.user_id) {
            if (req.body.selected) {
                let items = [];
                for (let [key, line] of Object.entries(req.body.selected)) {
                    items.push(line);
                };
                fn.createRequest(
                    req.body.requested_for,
                    items,
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
    app.delete('/stores/requests/:id', isLoggedIn, allowed('requests_delete'), (req, res) => {
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
    app.put('/stores/requests/:id/approval', isLoggedIn, allowed('requests_edit'), (req, res) => {
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
        if (query.complete === 2)      where._complete = 0;
        else if (query.complete === 3) where._complete = 1;
        if (req.allowed === false) where.requested_for = req.user.user_id;
        fn.getAllWhere(
            m.requests,
            where,
            {
                include: [
                    {model: m.request_lines, as: 'lines'},
                    fn.users('_for')
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
    app.get('/stores/requests/:id', isLoggedIn, allowed('requests_edit', false), (req, res) => {
        fn.getOne(
            m.requests,
            {request_id: req.params.id},
            {
                include: [
                    {
                        model: m.request_lines,
                        as: 'lines',
                        include: [
                            {model: m.item_sizes, include: fn.itemSize_inc({stock: true, nsns: true})},
                            fn.users()
                        ]
                    },
                    fn.users('_for'),
                    fn.users('_by')
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