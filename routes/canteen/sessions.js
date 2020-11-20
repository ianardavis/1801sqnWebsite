const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    let canteen  = require(`${process.env.ROOT}/fn/canteen`),
        settings = require(`${process.env.ROOT}/fn/settings`);
    app.get('/canteen/sessions',           permissions, allowed('access_canteen'),     (req, res) => res.render('canteen/sessions/index'));
    app.get('/canteen/sessions/:id',       permissions, allowed('access_canteen'),     (req, res) => res.render('canteen/sessions/show', {tab: req.query.tab || 'details'}));

    app.get('/canteen/get/sessions',       permissions, allowed('access_sessions'),    (req, res) => {
        m.sessions.findAll({
            where: req.query,
            include: [
                inc.users({as: 'user_open'}),
                inc.users({as: 'user_close'})
            ]
        })
        .then(sessions => res.send({result: true, sessions: sessions}))
        .catch(err => res.error.redirect(err, req, res));
    });

    app.post('/canteen/sessions',          permissions, allowed('canteen_supervisor'), (req, res) => {
        let session = {};
        session._opening_balance = 0.0;
        for (let [key, denomination] of Object.entries(req.body.opening_balance)) {
            for (let [key, value] of Object.entries(denomination)) {
                session._opening_balance += Number(value);
            };
        };
        session.opened_by = req.user.user_id;
        m.sessions.create(session)
        .then(new_session => {
            settings.edit({
                m: {settings: m.settings},
                name: 'session',
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
    
    app.put('/canteen/sessions/:id',       permissions, allowed('canteen_supervisor'), (req, res) => {
        m.sessions.update(
            req.body.session,
            {where: {session_id: req.params.id}}
        )
        .then(result => {
            req.flash('success', 'Session updated');
            res.redirect('/canteen/sessions/' + req.params.id);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.put('/canteen/sessions/:id/close', permissions, allowed('canteen_supervisor'), (req, res) => {
        m.sales.findAll({where: {_complete: 0}})
        .then(sales => {
            let salesToDelete = [];
            sales.forEach(sale => {
                salesToDelete.push(
                    m.sales.destroy({where: {sale_id: sale.sale_id}})
                );
                salesToDelete.push(
                    m.sale_lines.destroy({where: {sale_id: sale.sale_id}})
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
                        m.sale_lines.findAll({
                            include: [{
                                model: m.sales,
                                as: 'sale',
                                where: {session_id: req.params.id}
                            }]
                        })
                        .then(sales => {
                            m.sessions.findOne({where: {session_id: req.params.id}})
                            .then(session => {
                                let takings = 0;
                                sales.forEach(sale => takings += (Number(sale._price) * Number(sale._qty)));
                                m.sessions.update(
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
                                        name: 'ession',
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