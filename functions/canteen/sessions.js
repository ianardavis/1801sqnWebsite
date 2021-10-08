module.exports = function (m, fn) {
    fn.sessions = {};
    fn.sessions.countCash = function (obj) {
        let cash = 0.0;
        for (let [key, denomination] of Object.entries(obj)) {
            for (let [key, value] of Object.entries(denomination)) {
                cash += Number(value);
            };
        };
        return cash;
    };
    fn.sessions.create = function (balance, user_id) {
        return new Promise((resolve, reject) => {
            let cash = fn.sessions.countCash(balance);
            return m.holdings.findOrCreate({where: {description: 'Canteen float'}})
            .then(([holding, created]) => {
                return fn.update(holding, {cash: cash})
                .then(result => {
                    return m.sessions.findOrCreate({
                        where:    {status: 1},
                        defaults: {user_id_open: user_id}
                    })
                    .then(([session, created]) => {
                        return fn.actions.create({
                            action: `Count on session opening. Cash: £${cash}`,
                            user_id: user_id,
                            links: [{table: 'holdings', id: holding.holding_id}]
                        })
                        .then(result => {
                            if (created) resolve('Session opened')
                            else         resolve('Session already open');
                        })
                        .catch(err => {
                            console.log(err);
                            if (created) resolve('Session opened')
                            else         resolve('Session already open');
                        })
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.sessions.getSales = function (session_id) {
        return new Promise((resolve, reject) => {
            return m.payments.findAll({
                where:   {type: {[fn.op.or]: ['Cash', 'cash']}},
                include: [fn.inc.canteen.sale({where: {session_id: session_id}, required: true})]
            })
            .then(payments => {
                let takings = 0.0;
                payments.forEach(e => takings.cash += e.amount);
                resolve(takings);
            })
            .catch(err => reject(err));
        });
    };
    fn.sessions.close = function (session_id, balance, user_id) {
        return new Promise((resolve, reject) => {
            fn.get(
                'sessions',
                {session_id: session_id}
            )
            .then(session => {
                if (session.status !== 1) reject(new Error('This session is not open'))
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
                            return fn.sessions.getSales(session.session_id)
                            .then(takings => {
                                return m.holdings.findOrCreate({where: {description: 'Canteen float'}})
                                .then(([holding, created]) => {
                                    let counted = fn.sessions.countCash(balance),
                                        cash_in = counted - holding.cash,
                                        actions = [];
                                    actions.push(fn.update(holding, {cash: counted}));
                                    if (cash_in !== 0) {
                                        actions.push(
                                            m.movements.create({
                                                session_id:    session.session_id,
                                                holding_id_to: holding.holding_id,
                                                description:   'Canteen takings',
                                                amount:        cash_in,
                                                type:          'Cash',
                                                user_id:       user_id
                                            })
                                        )
                                    };
                                    if (cash_in !== takings) {
                                        actions.push(m.notes.create({
                                            note:    `Takings discrepency: Cash ${(cash_in > takings ? 'over' : 'under')} by £${cash_in - takings}`,
                                            _table:  'holdings',
                                            id:      holding.holding_id,
                                            system:  1,
                                            user_id: user_id
                                        }))
                                    };
                                    return Promise.all(actions)
                                    .then(results => {
                                        return fn.update(
                                            session,
                                            {
                                                status:        2,
                                                datetime_end:  Date.now(),
                                                user_id_close: user_id
                                            }
                                        )
                                        .then(result => resolve({takings: takings, cash_in: cash_in}))
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
};