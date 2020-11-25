const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    let canteen  = require(`${process.env.ROOT}/fn/canteen`),
        settings = require(`${process.env.ROOT}/fn/settings`);
    app.get('/canteen/sessions',     permissions, allowed('access_canteen'),                (req, res) => res.render('canteen/sessions/index'));
    app.get('/canteen/sessions/:id', permissions, allowed('access_canteen'),                (req, res) => res.render('canteen/sessions/show', {tab: req.query.tab || 'details'}));

    app.get('/canteen/get/sessions', permissions, allowed('access_sessions', {send: true}), (req, res) => {
        m.sessions.findAll({
            where: req.query,
            include: [
                inc.users({as: 'user_open'}),
                inc.users({as: 'user_close'}),
            ]
        })
        .then(sessions => res.send({result: true, sessions: sessions}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/canteen/get/session',  permissions, allowed('access_sessions', {send: true}), (req, res) => {
        m.sessions.findOne({
            where: req.query,
            include: [
                inc.users({as: 'user_open'}),
                inc.users({as: 'user_close'}),
            ]
        })
        .then(session => {
            return getSessionSales(session.session_id)
            .then(sales => res.send({result: true, session: {...session.dataValues, ...sales}}))
            .catch(err => res.error.send(err, res))
        })
        .catch(err => res.error.send(err, res));
    });

    app.post('/canteen/sessions',    permissions, allowed('session_add',     {send: true}), (req, res) => {
        let balance = countCash(req.body.balance);
        m.holdings.findOrCreate({
            where: {_description: 'Canteen'},
            defaults: {
                _cash:    balance.cash,
                _cheques: balance.cheques
            }
        })
        .then(([holding, created]) => {
            let actions = [];
            actions.push(
                m.holdings.update(
                    {_cash: Number(balance.cash) || 0, _cheques: Number(balance.cheques) || 0},
                    {where: {holding_id: holding.holding_id}}
                )
            );
            actions.push(
                m.cash_movements.create({
                    _description:  'Count',
                    _amount:       Number(balance.cash - holding._cash),
                    _type:         'Cash',
                    holding_id_to: holding.holding_id,
                    _status:       2,
                    user_id:       req.user.user_id
                })
            );
            actions.push(
                m.cash_movements.create({
                    _description:  'Count',
                    _amount:       Number(balance.cheques - holding._cheques),
                    _type:         'Cheque',
                    holding_id_to: holding.holding_id,
                    _status:       2,
                    user_id:       req.user.user_id
                })
            );
            return Promise.all(actions)
            .then(results => {
                return m.sessions.findOrCreate({
                    where:    {_status: 1},
                    defaults: {user_id_open: req.user.user_id}
                })
                .then(([session, created]) => {
                    if (created) res.send({result: true, message: `Session opened\nSession ID: ${session.session_id}`})
                    else         res.send({result: true, message: `Session already open\nSession ID: ${session.session_id}`})
                })
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    
    app.put('/canteen/sessions/:id', permissions, allowed('session_edit',    {send: true}), (req, res) => {
        m.sessions.findOne({
            where: {session_id: req.params.id},
            attributes: ['session_id', '_status']
        })
        .then(session => {
            if (session._status !== 1) res.send({result: false, message: 'This session is not open'})
            else {
                return m.sales.findAll({
                    where: {
                        session_id: session.session_id,
                        _status: 1
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
                                where: {_description: 'Petty Cash'},
                                defaults: {_cash: 0, _cheques: 0}
                            })
                            .then(([petty_holding, created]) => {
                                return m.holdings.findOrCreate({
                                    where: {_description: 'Canteen'},
                                    defaults: {_cash: 0, _cheques: 0}
                                })
                                .then(([canteen_holding, created]) => {
                                    let balance = countCash(req.body.balance),
                                        movement_actions = [];
                                    if (balance.cash > 0) {
                                        movement_actions.push(
                                            m.cash_movements.create({
                                                holding_id_from: canteen_holding.holding_id,
                                                holding_id_to:   petty_holding.holding_id,
                                                _description:    'Canteen cash',
                                                _amount:         balance.cash,
                                                _type:           'Transfer',
                                                user_id:         req.user.user_id
                                            })
                                        );
                                    };
                                    if (balance.cheques > 0) {
                                        movement_actions.push(
                                            m.cash_movements.create({
                                                holding_id_from: canteen_holding.holding_id,
                                                holding_id_to:   petty_holding.holding_id,
                                                _description:    'Canteen cheques',
                                                _amount:         balance.cheques,
                                                _type:           'Transfer',
                                                user_id:         req.user.user_id
                                            })
                                        );
                                    };
                                    return Promise.all(movement_actions)
                                    .then(results => {
                                        return session.update(
                                            {
                                                _status: 2,
                                                _end: Date.now(),
                                                user_id_close: req.user.user_id
                                            }
                                        )
                                        .then(result => res.send({result: true, message: `Session closed.\nTakings: £${sales.takings.toFixed(2)}.\nPaid Out: £${sales.paid_out.toFixed(2)}.\nPaid In: £${sales.paid_in.toFixed(2)}.\nCash Returned: £${Number(balance.cash).toFixed(2)}.\nCheques Returned: £${Number(balance.cheques).toFixed(2)}`}))
                                        .catch(err => res.error.redirect(err, req, res));
                                    })
                                    .catch(err => res.error.send(err, res));
                                })
                                .catch(err => res.error.send(err, res));
                            })
                            .catch(err => res.error.send(err, res));
                        })
                        .catch(err => res.error.redirect(err, req, res));
                    })
                    .catch(err => res.error.redirect(err, req, res));
                })
                .catch(err => res.error.redirect(err, req, res));
            };
        })
        .catch(err => res.error.send(err, res));
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
                ],
                attributes: ['item_id', '_price', '_qty']
            })
            .then(lines => {
                let result = {takings: 0, paid_out: 0, paid_in: 0};
                lines.forEach(line => {
                    if (line.item_id === 0) {
                        result.paid_out += Number(line._price);
                    } else if (line.item_id === 1) {
                        result.paid_in += Number(line._price);
                    } else result.takings += (Number(line._price) * Number(line._qty))
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
                if (key === 'cheques') cheques = value
                else cash += Number(value);
            };
        };
        return {cash: cash, cheques: cheques};
    };
};