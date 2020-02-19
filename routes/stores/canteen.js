const op = require('sequelize').Op;
module.exports = (app, allowed, fn, isLoggedIn, m) => {
    var getSession = (req, res, options = {}) => new Promise(resolve => {
        fn.getSetting({setting: 'canteen_session', default: -1})
        .then(session_id => {
            if (Number(session_id) === -1 && options.redirect) {
                req.flash('danger', 'No session open');
                res.redirect('/stores/canteen');
            } else resolve(session_id);
        })
        .catch(err => {
            fn.error(err, '/stores/canteen', req, res)
        })
    });
    var getSale = (req, res) => new Promise(resolve => {
        fn.getSetting({setting: 'sale_' + req.user.user_id, default: -1})
        .then(sale_id => {
            if (Number(sale_id) === -1) {
                getSession(req, res, {redirect: true})
                .then(session_id => {
                    fn.create(
                        m.canteen_sales,
                        {
                            session_id: session_id,
                            user_id: req.user.user_id
                        }
                    )
                    .then(sale => {
                        fn.editSetting('sale_' + req.user.user_id, sale.sale_id)
                        .then(result => {
                            if (result) resolve(sale.sale_id)
                            else fn.error(new error('User sale not saved to setting'), '/stores/canteen', req, res);
                        })
                        .catch(err => fn.error(err, '/stores/canteen', req, res));
                    })
                    .catch(err => fn.error(err, '/stores/canteen', req, res));
                });
            } else resolve(sale_id);
        })
        .catch(err => fn.error(err, '/stores/canteen', req, res));
    });

    // Index
    app.get('/stores/canteen', isLoggedIn, allowed('access_canteen'), (req, res) => {
        getSession(req, res)
        .then(session_id => res.render('stores/canteen/index', {session_id: session_id}));
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////

    // Index
    app.get('/stores/canteen/items', isLoggedIn, allowed('access_canteen'), (req, res) => {
        fn.getAllWhere(m.canteen_items, {item_id: {[op.not]: 0}})
        .then(items => res.render('stores/canteen/items', {items: items}))
        .catch(err => fn.error(err, '/stores/canteen', req, res));
    });
    // New
    app.post('/stores/canteen/items', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.create(
            m.canteen_items,
            req.body.item
        )
        .then(item => {
            req.flash('success', 'Item added');
            res.redirect('/stores/canteen/items');
        })
        .catch(err => fn.error(err, '/stores/canteen/items', req, res));
    });
    // Edit
    app.put('/stores/canteen/items/:id', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.update(
            m.canteen_items,
            req.body.item,
            {item_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Item updated');
            res.redirect('/stores/canteen/items');
        }).catch(err => fn.error(err, '/stores/canteen/items', req, res));
    });
    // Delete
    app.delete('/stores/canteen/items/:id', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        if (Number(req.params.id) !== 0) {
            fn.delete(
                'canteen_items',
                {item_id: req.params.id}
            )
            .then(result => {
                req.flash('success', 'Item deleted');
                res.redirect('/stores/canteen/items');
            })
            .catch(err => fn.error(err, '/stores/canteen/items', req, res));
        } else {
            req.flash('danger', 'This item can not be deleted');
            res.redirect('/stores/canteen/items');
        };
    });
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    // Index
    app.get('/stores/canteen/sessions', isLoggedIn, allowed('access_canteen'), (req, res) => {
        fn.getAll(
            m.canteen_sessions,
            [{model: m.canteen_sales, as: 'sales'}]
        )
        .then(sessions => {
            getSession(req, res)
            .then(session_id => {
                res.render('stores/canteen/sessions/index', {
                    sessions: sessions,
                    session: session_id
                });
            });
        })
        .catch(err => fn.error(err, '/stores/canteen', req, res));
    });
    // New
    app.post('/stores/canteen/sessions', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
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
                if (result) res.redirect('/stores/canteen/pos');
                else fn.error(new Error('Session not saved to settings'), '/', req, res);
            })
            .catch(err => fn.error(err, '/stores/canteen/sessions', req, res));
        })
        .catch(err => fn.error(err, '/stores/canteen/sessions', req, res));
    });
    //Show
    app.get('/stores/canteen/sessions/:id', isLoggedIn, allowed('access_canteen'), (req, res) => {
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
                        fn.users()
                    ]
                },
                fn.users('_opened_by'),
                fn.users('_closed_by')
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
                res.render('stores/canteen/sessions/show', {
                    session: session,
                    items: items
                });
            })
            .catch(err => fn.error(err, '/stores/canteen', req, res));
        })
        .catch(err => fn.error(err, '/stores/canteen', req, res));
    });
    // Close session
    app.put('/stores/canteen/sessions/:id', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
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
                                        res.redirect('/stores/canteen/sessions');
                                    })
                                    .catch(err => fn.error(err, '/stores/canteen/sessions', req, res));
                                })
                                .catch(err => fn.error(err, '/stores/canteen/sessions', req, res));
                            })
                            .catch(err => fn.error(err, '/stores/canteen/sessions', req, res));
                        })
                        .catch(err => fn.error(err, '/stores/canteen/sessions', req, res));
                    })
                    .catch(err => fn.error(err, '/stores/canteen/sessions', req, res));
                })
                .catch(err => fn.error(err, '/stores/canteen/sessions', req, res));
            })
            .catch(err => fn.error(err, '/stores/canteen/sessions', req, res));
        })
        .catch(err => fn.error(err, '/stores/canteen/sessions', req, res));
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////

    app.get('/stores/canteen/pos', isLoggedIn, allowed('access_canteen'), (req, res) => {
        getSale(req, res)
        .then(sale_id => {
            fn.getAllWhere(m.canteen_items, {_current: 1})
            .then(items => {
                fn.getAllWhere(
                    m.canteen_sale_lines,
                    {sale_id: sale_id},
                    {include: [{model: m.canteen_items, as: 'item'}]}
                )
                .then(sale_items => {
                    res.render('stores/canteen/pos', {
                        items:      items,
                        sale_items: sale_items,
                        sale_id:    sale_id
                    })
                })
                .catch(err => fn.error(err, '/stores/canteen', req, res));
            })
            .catch(err => fn.error(err, '/stores/canteen', req, res));
        })
    });
    app.post('/stores/canteen/sale_lines', isLoggedIn, allowed('access_canteen'), (req, res) => {
        if (req.body.sale_line) {
            getSession(req, res, {redirect: true})
            .then(session_id => {
                fn.getOne(
                    m.canteen_sale_lines,
                    {
                        sale_id: req.body.sale_line.sale_id,
                        item_id: req.body.sale_line.item_id
                    },
                    {nullOK: true}
                )
                .then(line => {
                    if (!line || Number(req.body.sale_line.item_id) === 0) {
                        fn.create(
                            m.canteen_sale_lines,
                            req.body.sale_line
                        )
                        .then(sale_line => res.redirect('/stores/canteen/pos'))
                        .catch(err =>fn.error(err, '/stores/canteen/pos', req, res));
                    } else {
                        let newQty = Number(line._qty) + Number(req.body.sale_line._qty)
                        if (newQty === 0) {
                            fn.delete('canteen_sale_lines', {sale_line_id: line.sale_line_id})
                            .then(result => res.redirect('/stores/canteen/pos'))
                            .catch(err =>fn.error(err, '/stores/canteen/pos', req, res));
                        } else {
                            fn.update(
                                m.canteen_sale_lines,
                                {_qty: newQty},
                                {sale_line_id: line.sale_line_id}
                            )
                            .then(result => res.redirect('/stores/canteen/pos'))
                            .catch(err =>fn.error(err, '/stores/canteen/pos', req, res));
                        };
                    };
                })
                .catch(err =>fn.error(err, '/stores/canteen/pos', req, res));
            });
        } else {
            req.flash('danger', 'No items specified');
            res.redirect('/stores/canteen/pos');
        };
    });
    app.put('/stores/canteen/sale_lines', isLoggedIn, allowed('access_canteen'), (req, res) => {
        if (req.body.sale_line) {
            getSession(req, res, {redirect: true})
            .then(session_id => {
                fn.getOne(
                    m.canteen_sale_lines,
                    {sale_line_id: req.body.sale_line.sale_line_id}
                )
                .then(line => {
                    let newQty = Number(line._qty) + Number(req.body.sale_line._qty)
                    if (newQty <= 0) {
                        fn.delete('canteen_sale_lines', {sale_line_id: line.sale_line_id})
                        .then(result => res.redirect('/stores/canteen/pos'))
                        .catch(err =>fn.error(err, '/stores/canteen/pos', req, res));
                    } else {
                        fn.update(
                            m.canteen_sale_lines,
                            {_qty: newQty},
                            {sale_line_id: line.sale_line_id}
                        )
                        .then(result => res.redirect('/stores/canteen/pos'))
                        .catch(err =>fn.error(err, '/stores/canteen/pos', req, res));
                    };
                })
                .catch(err =>fn.error(err, '/stores/canteen/pos', req, res));
            });
        } else {
            req.flash('danger', 'No items specified');
            res.redirect('/stores/canteen/pos');
        };
    });
    app.put('/stores/canteen/sales/:id', isLoggedIn, allowed('access_canteen'), (req, res) => {
        if (req.body.sale.tendered >= req.body.sale.total) {
            fn.update(
                m.canteen_sales,
                {_complete: 1},
                {sale_id: req.params.id}
            )
            .then(result => {
                fn.getAllWhere(
                    m.canteen_sale_lines,
                    {sale_id: req.params.id}
                )
                .then(lines => {
                    let actions = [];
                    lines.forEach(line => actions.push(fn.subtractCanteenStock(line.item_id, line._qty)));
                    Promise.allSettled(actions)
                    .then(results => {
                        fn.editSetting('sale_' + req.user.user_id, -1)
                        .then(result => {
                            getSale(req, res)
                            .then(sale_id => {
                                req.flash('success', 'Sale complete. Change: £' + Number(req.body.sale.tendered - req.body.sale.total).toFixed(2));
                                res.redirect('/stores/canteen/pos');
                            })
                        })
                        .catch(err => fn.error(err, '/stores/canteen', req, res));
                    })
                    .catch(err => fn.error(err, '/stores/canteen/pos'))
                })
                .catch();
                
            })
            .catch(err => fn.error(err, '/stores/canteen/pos'));
        } else {
            req.flash('danger', 'Not enough tendered');
            res.redirect('/stores/canteen/pos')
        };
    });
};