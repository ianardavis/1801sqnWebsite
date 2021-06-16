module.exports = (app, m, inc, fn) => {
    let settings = require(`${process.env.ROOT}/fn/settings`);
    app.get('/sessions',     fn.loggedIn(), fn.permissions.get('access_canteen'),    (req, res) => res.render('canteen/sessions/index'));
    app.get('/sessions/:id', fn.loggedIn(), fn.permissions.get('access_canteen'),    (req, res) => res.render('canteen/sessions/show'));

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
                    },
                    attributes: ['sale_id']
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
                        .then(sales => {
                            return m.holdings.findOrCreate({
                                where: {description: 'Petty Cash'},
                                defaults: {cash: 0, cheques: 0}
                            })
                            .then(([petty_holding, created]) => {
                                return m.holdings.findOrCreate({
                                    where: {description: 'Canteen'},
                                    defaults: {cash: 0, cheques: 0}
                                })
                                .then(([canteen_holding, created]) => {
                                    let balance = countCash(req.body.balance),
                                        movement_actions = [];
                                    if (balance.cash > 0) {
                                        movement_actions.push(
                                            m.movements.create({
                                                holding_id_from: canteen_holding.holding_id,
                                                holding_id_to:   petty_holding.holding_id,
                                                description:    'Canteen cash',
                                                amount:         balance.cash,
                                                type:           'Transfer',
                                                user_id:         req.user.user_id
                                            })
                                        );
                                    };
                                    if (balance.cheques > 0) {
                                        movement_actions.push(
                                            m.movements.create({
                                                holding_id_from: canteen_holding.holding_id,
                                                holding_id_to:   petty_holding.holding_id,
                                                description:    'Canteen cheques',
                                                amount:          balance.cheques,
                                                type:           'Transfer',
                                                user_id:         req.user.user_id
                                            })
                                        );
                                    };
                                    return Promise.all(movement_actions)
                                    .then(results => {
                                        return session.update(
                                            {
                                                status: 2,
                                                datetime_end: Date.now(),
                                                user_id_close: req.user.user_id
                                            }
                                        )
                                        .then(result => res.send({success: true, message: `Session closed.\nTakings: £${sales.takings.toFixed(2)}.\nPaid Out: £${sales.paid_out.toFixed(2)}.\nPaid In: £${sales.paid_in.toFixed(2)}.\nCash Returned: £${Number(balance.cash).toFixed(2)}.\nCheques Returned: £${Number(balance.cheques).toFixed(2)}`}))
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
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    function getSessionSales(session_id) {
        return new Promise((resolve, reject) => {
            return m.sale_lines.findAll({
                include: [
                    inc.sales({
                        as:       'sale',
                        where:    {session_id: session_id},
                        required: true
                    })
                ]
            })
            .then(lines => {
                let result = {takings: 0, paid_out: 0, paid_in: 0};
                lines.forEach(line => {
                    if (line.item_id === 0) {
                        result.paid_out += Number(line.price);
                    } else if (line.item_id === 1) {
                        result.paid_in += Number(line.price);
                    } else result.takings += (Number(line.price) * Number(line.qty))
                });
                resolve(result);
            })
            .catch(err => reject(err));
        });
    };
    function countCash(obj) {
        let cash = 0.0, cheques = 0.0;
        for (let [key, denomination] of Object.entries(obj)) {
            for (let [key, value] of Object.entries(denomination)) {
                if (key === 'cheques') cheques = Number(value)
                else cash += Number(value);
            };
        };
        return {cash: cash, cheques: cheques};
    };
};