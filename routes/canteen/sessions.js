module.exports = (app, m, inc, fn) => {
    app.get('/sessions',     fn.loggedIn(), fn.permissions.get('access_sessions'),   (req, res) => res.render('canteen/sessions/index'));
    app.get('/sessions/:id', fn.loggedIn(), fn.permissions.get('access_sessions'),   (req, res) => res.render('canteen/sessions/show'));

    app.get('/get/sessions', fn.loggedIn(), fn.permissions.check('access_sessions'), (req, res) => {
        m.sessions.findAll({
            where: req.query,
            include: [
                inc.user({as: 'user_open'}),
                inc.user({as: 'user_close'}),
            ]
        })
        .then(sessions => res.send({success: true, result: sessions}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/session',  fn.loggedIn(), fn.permissions.check('access_sessions'), (req, res) => {
        fn.get(
            'sessions',
            req.query,
            [
                inc.user({as: 'user_open'}),
                inc.user({as: 'user_close'}),
            ]
        )
        .then(session => res.send({success: true, result: session}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/sessions',    fn.loggedIn(), fn.permissions.check('session_add'),     (req, res) => {
        let balance = countCash(req.body.balance);
        m.holdings.findOrCreate({where: {description: 'Canteen float'}})
        .then(([holding, created]) => {
            holding.update({cash: balance.cash, cheques: balance.cheques})
            .then(result => {
                if (!result) fn.send_error(res, 'Holding not updated')
                else {
                    return m.sessions.findOrCreate({
                        where:    {status: 1},
                        defaults: {user_id_open: req.user.user_id}
                    })
                    .then(([session, created]) => {
                        fn.actions.create({
                            action: `Count on session opening. Cash: £${balance.cash}. Cheques: £${balance.cheques}`,
                            user_id: req.user.user_id,
                            links: [{table: 'holdings', id: holding.holding_id}]
                        })
                        .then(result => {
                            if (created) res.send({success: true, message: 'Session opened'})
                            else         res.send({success: true, message: 'Session already open'});
                        })
                        .catch(err => {
                            console.log(err);
                            if (created) res.send({success: true, message: 'Session opened'})
                            else         res.send({success: true, message: 'Session already open'});
                        })
                    })
                    .catch(err => fn.send_error(res, err));
                };
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    
    app.put('/sessions/:id', fn.loggedIn(), fn.permissions.check('session_edit'),    (req, res) => {
        fn.get(
            'sessions',
            {session_id: req.params.id}
        )
        .then(session => {
            if (session.status !== 1) fn.send_error(res, 'This session is not open')
            else {
                return m.sales.findAll({
                    where: {
                        session_id: session.session_id,
                        status: 1
                    }
                })
                .then(sales => {
                    let sale_actions = [];
                    sales.forEach(sale => {
                        sale_actions.push(sale.destroy());
                        sale_actions.push(m.sale_lines.destroy({where: {sale_id: sale.sale_id}}));
                    })
                    return Promise.allSettled(sale_actions)
                    .then(results => {
                        return getSessionSales(session.session_id)
                        .then(takings => {
                            return m.holdings.findOrCreate({where: {description: 'Canteen float'}})
                            .then(([holding, created]) => {
                                let counted = countCash(req.body.balance),
                                    cash_in = counted - holding.cash,
                                    actions = [];
                                actions.push(holding.update({cash: counted}));
                                if (cash_in !== 0) {
                                    actions.push(
                                        m.movements.create({
                                            session_id:    session.session_id,
                                            holding_id_to: holding.holding_id,
                                            description:   'Canteen takings',
                                            amount:        cash_in,
                                            type:          'Cash',
                                            user_id:       req.user.user_id
                                        })
                                    )
                                };
                                if (cash_in !== takings) {
                                    actions.push(m.notes.create({
                                        note: `Takings discrepency: Cash ${(cash_in > takings ? 'over' : 'under')} by £${cash_in - takings}`,
                                        _table: 'holdings',
                                        id: holding.holding_id,
                                        system: 1,
                                        user_id: req.user.user_id
                                    }))
                                };
                                return Promise.all(actions)
                                .then(results => {
                                    return session.update({
                                        status:        2,
                                        datetime_end:  Date.now(),
                                        user_id_close: req.user.user_id
                                    })
                                    .then(result => res.send({success: true, message: `Session closed.\nTakings: £${takings.toFixed(2)}.\nCash In: £${cash_in.toFixed(2)}.`}))
                                    .catch(err => fn.send_error(res, err));
                                })
                                .catch(err => fn.send_error(res, err));
                            })
                            .catch(err => fn.send_error(res, err));
                        })
                        .catch(err => fn.send_error(res, err));
                    })
                    .catch(err => fn.send_error(res, err));
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    function getSessionSales(session_id) {
        return new Promise((resolve, reject) => {
            return m.payments.findAll({
                where: {type: {[fn.op.or]: ['Cash', 'cash']}},
                include: [
                    inc.sale({
                        where:    {session_id: session_id},
                        required: true
                    })
                ]
            })
            .then(payments => {
                let takings = 0.0;
                payments.forEach(e => takings.cash += e.amount);
                resolve(takings);
            })
            .catch(err => reject(err));
        });
    };
    function countCash(obj) {
        let cash = 0.0;
        for (let [key, denomination] of Object.entries(obj)) {
            for (let [key, value] of Object.entries(denomination)) {
                cash += Number(value);
            };
        };
        return cash;
    };
};