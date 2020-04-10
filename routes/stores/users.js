const op     = require('sequelize').Op,
      bCrypt = require('bcrypt');
function options() {
    return [
        {table: 'ranks'},
        {table: 'statuses'}
    ]
};
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //INDEX
    app.get('/stores/users', isLoggedIn, allowed('access_users', {allow: true}), (req, res) => {
        if (!req.allowed) res.redirect('/stores/users/' + req.user.user_id);
        else {
            let query = Number(req.query.status) || 1;
            fn.getAll(m.statuses)
            .then(statuses => {
                fn.getAllWhere(
                    m.users,
                    {
                        user_id: {[op.not]: 1},
                        status_id: query
                    },
                    {include: [m.ranks]}
                )
                .then(users => {
                    res.render('stores/users/index', {
                        users:    users,
                        status:   query,
                        statuses: statuses
                    });
                })
                .catch(err => fn.error(err, '/stores', req, res));
            });
        };
    });
    //NEW
    app.get('/stores/users/new', isLoggedIn, allowed('user_add'), (req, res) => {
        fn.getOptions(options(), req)
        .then(classes => res.render('stores/users/new', {classes: classes}))
    });
    //SHOW
    app.get('/stores/users/:id', isLoggedIn, allowed('access_users', {allow: true}), (req, res) => {
        if (req.allowed || req.user.user_id === Number(req.params.id)) {
            let where = {}, query = {};
            query.issued =   Number(req.query.issued)   || 2;
            query.closed =   Number(req.query.closed)   || 2;
            query.returned = Number(req.query.returned) || 2;
            query.system =   Number(req.query.system)   || 2;
            where.requests = {};
            where.orders =   {};
            where.issues =   {};
            if (query.issued === 2)        where.orders.issue_line_id  = null;
            else if (query.issued === 3)   where.orders.issue_line_id  = {[op.not]: null};

            if (query.closed === 2)        where.requests._status      = 'Pending';
            else if (query.closed === 3)   where.requests._status      = {[op.not]: 'Pending'};

            if (query.returned === 2)      where.issues.return_line_id = null;
            else if (query.returned === 3) where.issues.return_line_id = {[op.not]: null};

            fn.getOne(
                m.users,
                {user_id: req.params.id},

                {include: [m.ranks, m.permissions, m.statuses]}
            )
            .then(user => {
                fn.getAllWhere(
                    m.request_lines,
                    where.requests,
                    {
                        include: [
                            inc.requests({where: {requested_for: user.user_id}, required: true}),
                            inc.sizes({stock: true})
                        ]
                    }
                )
                .then(requests => {
                    fn.getAllWhere(
                        m.order_lines,
                        where.orders,
                        {
                            include: [
                                inc.orders({where: {ordered_for: user.user_id}, required: true}),
                                inc.sizes({stock: true})
                            ]
                        }
                    )
                    .then(orders => {
                        fn.getAllWhere(
                            m.issue_lines,
                            where.issues,
                            {
                                include: [
                                    inc.return_lines({as: 'return', include: [inc.stock()]}),
                                    inc.issues({where: {issued_to: user.user_id}, required: true}),
                                    inc.stock({
                                        size: true,
                                        include: [
                                            m.locations,
                                            inc.sizes({include:[
                                                m.items,
                                                inc.stock()
                                            ]})
                                        ]
                                    })
                                ]
                            }
                        )
                        .then(issues => {
                            fn.getNotes('users', req.params.id, req)
                            .then(notes => {
                                res.render('stores/users/show', {
                                    f_user:   user, 
                                    requests: requests,
                                    orders:   orders,
                                    issues:   issues,
                                    notes:    notes,
                                    query:    query,
                                    show_tab: req.query.tab || 'details'
                                });
                            });
                        })
                        .catch(err => fn.error(err, '/stores/users', req, res));
                    })
                    .catch(err => fn.error(err, '/stores/users', req, res));
                })
                .catch(err => fn.error(err, '/stores/users', req, res));
            })
            .catch(err => fn.error(err, '/stores/users', req, res));
        } else {
            req.flash('danger', 'Permission denied!')
            res.redirect('/stores/users');
        };
    });
    //EDIT PASSWORD
    app.get('/stores/users/:id/password', isLoggedIn, allowed('user_password', {allow: true}), (req, res) => {
        if (req.allowed || req.user.user_id === Number(req.params.id)) {
            fn.getOne(
                m.users,
                {user_id: req.params.id},
                {include: [m.ranks]}
            )
            .then(user => res.render('stores/users/password', {user: user}))
            .catch(err => fn.error(err, '/', req, res));
        } else fn.error(new Error('Permission denied'), '/', req, res);
    });
    //EDIT
    app.get('/stores/users/:id/edit', isLoggedIn, allowed('user_edit'), (req, res) => {
        fn.getOptions(options(), req)
        .then(classes => {
            fn.getOne(
                m.users,
                {user_id: req.params.id},
                {include: [m.ranks]}
            )
            .then(user => {
                res.render('stores/users/edit', {
                    user:    user,
                    classes: classes
                });
            })
            .catch(err => fn.error(err, '/stores/users/' + req.params.id, req, res));
        });
    });

    //POST
    app.post('/stores/users', isLoggedIn, allowed('user_add', {send: true}), (req, res) => {
        let salt = bCrypt.genSaltSync(10);
        req.body.user._salt = salt;
        req.body.user._password = bCrypt.hashSync(req.body._password, salt);
        req.body.user._reset = 0
        fn.create(
            m.users,
            req.body.user
        )
        .then(user => {
            fn.create(
                m.permissions,
                {user_id: user.user_id}
            )
            .then(permission => res.send({result: true, message: 'User added'}))
            .catch(err => fn.send_error(err.message, res))
        })
        .catch(err => fn.send_error(err.message, res));
    });

    //PUT PASSWORD
    app.put('/stores/password/:id', isLoggedIn, allowed('user_password', {allow: true, send: true}), (req, res) => {
        if (req.allowed || req.user.user_id === Number(req.params.id)) {
            req.body.user._salt = bCrypt.genSaltSync(10)
            req.body.user._password = bCrypt.hashSync(req.body._password, req.body.user._salt);
            fn.update(
                m.users,
                req.body.user,
                {user_id: req.params.id}
            )
            .then(result => res.send({result: true, message: 'Password changed'}))
            .catch(err => fn.send_error(err.message, res));
        } else fn.send_error('Permission denied', res)
    });
    //PUT
    app.put('/stores/users/:id', isLoggedIn, allowed('user_edit', {send: true}), (req, res) => {
        if (!req.body.user)        req.body.user = {};
        if (!req.body.user._reset) req.body.user._reset = 0;
        fn.update(
            m.users,
            req.body.user,
            {user_id: req.params.id}
        )
        .then(result => res.send({result: true, message: 'User saved'}))
        .catch(err => fn.send_error(err,message, res));
    });

    //DELETE
    app.delete('/stores/users/:id', isLoggedIn, allowed('user_delete', {send: true}), (req, res) => {
        if (Number(req.user.user_id) !== Number(req.params.id)) {
            fn.delete(
                'users',
                {user_id: req.params.id}
            )
            .then(result => {
                if (result) req.flash('success', 'User deleted');
                fn.delete(
                    'permissions',
                    {user_id: req.params.id}
                )
                .then(result => res.send({result: true, message: 'User/Permissions deleted'}))
                .catch(err => fn.send_error(err.message, res));
            })
            .catch(err => fn.send_error(err.message, res));
        } else res.send_error('You can not delete your own account', res);       
    });
};