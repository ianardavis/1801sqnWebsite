const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let canteen  = require(process.env.ROOT + '/fn/canteen'),
        settings = require(process.env.ROOT + '/fn/settings');
    app.get('/canteen/sessions',           isLoggedIn, allowed('access_canteen'), (req, res) => {
        m.canteen_sessions.findAll({include: [{model: m.canteen_sales, as: 'sales'}]})
        .then(sessions => {
            canteen.getSession(req, res)
            .then(session_id => {
                res.render('canteen/sessions/index', {
                    sessions: sessions,
                    session: session_id
                });
            });
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.post('/canteen/sessions',          isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        let session = {};
        session._opening_balance = 0.0;
        for (let [key, denomination] of Object.entries(req.body.opening_balance)) {
            for (let [key, value] of Object.entries(denomination)) {
                session._opening_balance += Number(value);
            };
        };
        session.opened_by = req.user.user_id;
        m.canteen_sessions.create(session)
        .then(new_session => {
            settings.edit({
                m: {settings: m.settings},
                name: 'canteen_session',
                value: new_session.session_id
            })
            .then(result => {
                if (result) res.redirect('/canteen/pos');
                else res.error.redirect(new Error('Session not saved to settings'), '/', req, res);
            })
            .catch(err => res.error.redirect(err, req, res));
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/canteen/sessions/:id',       isLoggedIn, allowed('access_canteen'), (req, res) => {
        m.canteen_sessions.findOne({
            where: {session_id: req.params.id},
            include: [
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
        ]})
        .then(session => {
            m.canteen_items.findAll({
                include: [{
                    model: m.canteen_sale_lines,
                    as: 'sales',
                    required: true,
                    include: [{
                        model: m.canteen_sales,
                        as: 'sale',
                        where: {session_id: req.params.id}
            }]}]})
            .then(items => {
                res.render('canteen/sessions/show', {
                    session: session,
                    items: items
                });
            })
            .catch(err => res.error.redirect(err, req, res));
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.put('/canteen/sessions/:id',       isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        m.canteen_sessions.update(
            req.body.session,
            {where: {session_id: req.params.id}}
        )
        .then(result => {
            req.flash('success', 'Session updated');
            res.redirect('/canteen/sessions/' + req.params.id);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.put('/canteen/sessions/:id/close', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        m.canteen_sales.findAll({where: {_complete: 0}})
        .then(sales => {
            let salesToDelete = [];
            sales.forEach(sale => {
                salesToDelete.push(
                    m.canteen_sales.destroy({where: {sale_id: sale.sale_id}})
                );
                salesToDelete.push(
                    m.canteen_sale_lines.destroy({where: {sale_id: sale.sale_id}})
                );
            })
            Promise.allSettled(salesToDelete)
            .then(results => {
                m.settings.findAll({where: {_name: {[op.startsWith]: 'sale_'}}})
                .then(user_sales => {
                    let clear_sales = [];
                    user_sales.forEach(user => {
                        clear_sales.push(
                            settings.edit({
                                m: {settings: m.settings},
                                name: user._name,
                                value: -1
                            })
                        )
                    });
                    Promise.allSettled(clear_sales)
                    .then(results => {
                        m.canteen_sale_lines.findAll({
                            include: [{
                                model: m.canteen_sales,
                                as: 'sale',
                                where: {session_id: req.params.id}
                            }]
                        })
                        .then(sales => {
                            m.canteen_sessions.findOne({where: {session_id: req.params.id}})
                            .then(session => {
                                let takings = 0;
                                sales.forEach(sale => takings += (Number(sale._price) * Number(sale._qty)));
                                m.canteen_sessions.update(
                                    {
                                        _end: Date.now(),
                                        _takings: takings,
                                        _closing_balance: Number(session._opening_balance) + takings,
                                        closed_by: req.user.user_id
                                    },
                                    {where: {session_id: req.params.id}}
                                )
                                .then(result => {
                                    settings.edit({
                                        m: {settings: m.settings},
                                        name: 'canteen_session',
                                        value: -1
                                    })
                                    .then(result => {
                                        req.flash('success', 'Session closed. Takings: £'+ takings.toFixed(2));
                                        res.redirect('/canteen/sessions');
                                    })
                                    .catch(err => res.error.redirect(err, req, res));
                                })
                                .catch(err => res.error.redirect(err, req, res));
                            })
                            .catch(err => res.error.redirect(err, req, res));
                        })
                        .catch(err => res.error.redirect(err, req, res));
                    })
                    .catch(err => res.error.redirect(err, req, res));
                })
                .catch(err => res.error.redirect(err, req, res));
            })
            .catch(err => res.error.redirect(err, req, res));
        })
        .catch(err => res.error.redirect(err, req, res));
    });
};