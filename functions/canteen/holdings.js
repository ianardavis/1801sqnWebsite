module.exports = function (m, fn) {
    fn.holdings = {};
    fn.holdings.create = function (holding, user_id) {
        return new Promise((resolve, reject) => {
            if      (!holding)             reject(new Error('No holding details'))
            else if (!holding.description) reject(new Error('No description submitted'))
            else {
                m.holdings.findOrCreate({
                    where:    {description: holding.description},
                    defaults: {cash:        holding.cash || 0.0}
                })
                .then(([holding, created]) => {
                    if (!created) reject(new Error('This holding already exists'))
                    else {
                        return fn.actions.create(
                            `CREATED: Opening balance: £${Number(holding.cash).toFixed(2)}`,
                            user_id,
                            [{table: 'holdings', id: holding.holding_id}]
                        )
                        .then(result => resolve(true))
                        .catch(err => {
                            console.log(err);
                            resolve(false);
                        });
                    };
                })
                .catch(err => reject(err));
            };
        });
    };
    fn.holdings.count = function (holding_id, balance, user_id) {
        return new Promise((resolve, reject) => {
            fn.get(
                'holdings',
                {holding_id: holding_id}
            )
            .then(holding => {
                let cash = fn.sessions.countCash(balance);
                return fn.update(holding, {cash: cash})
                .then(result => {
                    return fn.actions.create(
                        `COUNT: £${Number(cash).toFixed(2)}. Holding ${(cash === holding.cash ? ' correct' : `${(holding.cash < cash ? 'under by' : 'over by')} £${Math.abs(holding.cash - cash)}`)}`,
                        user_id,
                        [{table: 'holdings', id: holding.holding_id}]
                    )
                    .then(result => resolve(true))
                    .catch(err => {
                        console.log(err);
                        resolve(false);
                    });
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};