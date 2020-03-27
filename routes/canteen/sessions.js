const op = require('sequelize').Op;
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    // Index
    app.get('/canteen/sessions', isLoggedIn, allowed('access_canteen'), (req, res) => {
        fn.getAll(
            m.canteen_sessions,
            [{model: m.canteen_sales, as: 'sales'}]
        )
        .then(sessions => {
            fn.getSession(req, res)
            .then(session_id => {
                res.render('canteen/sessions/index', {
                    sessions: sessions,
                    session: session_id
                });
            });
        })
        .catch(err => fn.error(err, '/canteen', req, res));
    });
    // New
    app.post('/canteen/sessions', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        let session = {};
        session._opening_balance = 0.0;
        for (let [key, denomination] of Object.entries(req.body.opening_balance)) {
            for (let [key, value] of Object.entries(denomination)) {
                session._opening_balance += Number(value);
            };
        };
        session.opened_by = req.user.user_id;
        fn.create(m.canteen_sessions, session)
        .then(new_session => {
            fn.editSetting('canteen_session', new_session.session_id)
            .then(result => {
                if (result) res.redirect('/canteen/pos');
                else fn.error(new Error('Session not saved to settings'), '/', req, res);
            })
            .catch(err => fn.error(err, '/canteen/sessions', req, res));
        })
        .catch(err => fn.error(err, '/canteen/sessions', req, res));
    });
    //Show
    app.get('/canteen/sessions/:id', isLoggedIn, allowed('access_canteen'), (req, res) => {
        fn.getOne(
            m.canteen_sessions,
            {session_id: req.params.id},
            {include: [
                {
                    model: m.canteen_sales,
                    as: 'sales',
                    include: [
                        {
                            model: m.canteen_sale_lines,
                            as: 'lines'
                        },
                        inc.users()
                    ]
                },
                inc.users({as: '_opened_by'}),
                inc.users({as: '_closed_by'})
            ]}
        )
        .then(session => {
            fn.getAll(
                m.canteen_items,
                [
                    {
                        model: m.canteen_sale_lines,
                        as: 'sales',
                        required: true,
                        include: [{
                            model: m.canteen_sales,
                            as: 'sale',
                            where: {session_id: req.params.id}
                        }]
                    }
                ]
            )
            .then(items => {
                res.render('canteen/sessions/show', {
                    session: session,
                    items: items
                });
            })
            .catch(err => fn.error(err, '/canteen', req, res));
        })
        .catch(err => fn.error(err, '/canteen', req, res));
    });
    // Close session
    app.put('/canteen/sessions/:id', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.update(
            m.canteen_sessions,
            req.body.session,
            {session_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Session updated');
            res.redirect('/canteen/sessions/' + req.params.id);
        })
        .catch(err => fn.error(err, '/canteen/sessions/' + req.params.id, req, res));
    });
    // Close session
    app.put('/canteen/sessions/:id/close', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.getAllWhere(m.canteen_sales, {_complete: 0})
        .then(sales => {
            let salesToDelete = [];
            sales.forEach(sale => salesToDelete.push(
                fn.delete(
                    'canteen_sales',
                    {sale_id: sale.sale_id},
                    {hasLines: true}
                )
            ))
            Promise.allSettled(salesToDelete)
            .then(results => {
                fn.getAllWhere(
                    m.settings,
                    {_name: {[op.startsWith]: 'sale_'}}
                )
                .then(user_sales => {
                    let clear_sales = [];
                    user_sales.forEach(user => clear_sales.push(fn.editSetting(user._name, -1)));
                    Promise.allSettled(clear_sales)
                    .then(results => {
                        fn.getAll(
                            m.canteen_sale_lines,
                            [{
                                model: m.canteen_sales,
                                as: 'sale',
                                where: {session_id: req.params.id}
                            }]
                        )
                        .then(sales => {
                            fn.getOne(
                                m.canteen_sessions,
                                {session_id: req.params.id}
                            )
                            .then(session => {
                                let takings = 0;
                                sales.forEach(sale => takings += (Number(sale._price) * Number(sale._qty)));
                                fn.update(
                                    m.canteen_sessions,
                                    {
                                        _end: Date.now(),
                                        _takings: takings,
                                        _closing_balance: Number(session._opening_balance) + takings,
                                        closed_by: req.user.user_id
                                    },
                                    {session_id: req.params.id}
                                )
                                .then(result => {
                                    fn.editSetting(
                                        'canteen_session',
                                        -1
                                    )
                                    .then(result => {
                                        req.flash('success', 'Session closed. Takings: £'+ takings.toFixed(2));
                                        res.redirect('/canteen/sessions');
                                    })
                                    .catch(err => fn.error(err, '/canteen/sessions', req, res));
                                })
                                .catch(err => fn.error(err, '/canteen/sessions', req, res));
                            })
                            .catch(err => fn.error(err, '/canteen/sessions', req, res));
                        })
                        .catch(err => fn.error(err, '/canteen/sessions', req, res));
                    })
                    .catch(err => fn.error(err, '/canteen/sessions', req, res));
                })
                .catch(err => fn.error(err, '/canteen/sessions', req, res));
            })
            .catch(err => fn.error(err, '/canteen/sessions', req, res));
        })
        .catch(err => fn.error(err, '/canteen/sessions', req, res));
    });
};