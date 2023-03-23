module.exports = function (m, fn) {
    fn.sessions = {};
    fn.sessions.get = function (where) {
        return fn.get(
            m.sessions,
            where,
            [
                fn.inc.users.user({as: 'user_open'}),
                fn.inc.users.user({as: 'user_close'})
            ]
        );
    };
    fn.sessions.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.sessions.findAndCountAll({
                where: where,
                include: [
                    fn.inc.users.user({as: 'user_open'}),
                    fn.inc.users.user({as: 'user_close'}),
                ],
                ...pagination
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
    fn.sessions.get_current = function () {
        return new Promise((resolve, reject) => {
            m.sessions.findAll({
                where: {
                    status: 1,
                    datetime_end: null
                }
            })
            .then(sessions => {
                if (!sessions || sessions.length === 0) {
                    reject(new Error('No open session'));

                } else if (sessions.length > 1) {
                    reject(new Error('Multiple sessions open'));

                } else {
                    resolve(session);

                };
            })
            .catch(reject);
        });
    };
    
    fn.sessions.count_cash = function (obj) {
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
            m.holdings.findOrCreate({where: {description: 'Canteen float'}})
            .then(([holding, created]) => {
                m.sessions.findOrCreate({
                    where:    {status: 1},
                    defaults: {user_id_open: user_id}
                })
                .then(([session, created]) => {
                    if (created) {
                        fn.holdings.count(holding.holding_id, balance, user_id)
                        .then(result => resolve('Session opened'))
                        .catch(reject);
                        
                    } else {
                        reject(new Error('Session already open'));

                    };
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };
    fn.sessions.getSales = function (session_id) {
        return new Promise((resolve, reject) => {
            m.payments.findAll({
                where:   {type: {[fn.op.or]: ['Cash', 'cash']}},
                include: [fn.inc.canteen.sale({where: {session_id: session_id}, required: true})]
            })
            .then(payments => {
                let takings = 0.0;
                payments.forEach(e => takings.cash += e.amount);
                resolve(takings);
            })
            .catch(reject);
        });
    };
    fn.sessions.close = function (session_id, balance, user_id) {
        return new Promise((resolve, reject) => {
            fn.sessions.get({session_id: session_id})
            .then(session => {
                if (session.status !== 1) {
                    reject(new Error('This session is not open'));

                } else {
                    m.sales.findAll({
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
                        Promise.allSettled(sale_actions)
                        .then(results => {
                            fn.sessions.getSales(session.session_id)
                            .then(takings => {
                                m.holdings.findOrCreate({where: {description: 'Canteen float'}})
                                .then(([holding, created]) => {
                                    let counted = fn.sessions.count_cash(balance),
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
                                    Promise.all(actions)
                                    .then(results => {
                                        fn.update(
                                            session,
                                            {
                                                status:        2,
                                                datetime_end:  Date.now(),
                                                user_id_close: user_id
                                            }
                                        )
                                        .then(result => resolve({takings: takings, cash_in: cash_in}))
                                        .catch(reject);
                                    })
                                    .catch(reject);
                                })
                                .catch(reject);
                            })
                            .catch(reject);
                        })
                        .catch(reject);
                    })
                    .catch(reject);

                };
            })
            .catch(reject);
        });
    };
};