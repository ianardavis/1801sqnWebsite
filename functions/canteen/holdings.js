module.exports = function (m, fn) {
    fn.holdings = {};
    fn.holdings.create = function (holding) {
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
                    else resolve(true);
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
                let actions = [],
                    cash    = fn.sessions.countCash(balance);
                actions.push(holding.update({cash: cash}));
                actions.push(
                    fn.actions.create({
                        action: `Cash counted: £${Number(cash).toFixed(2)}. Holding ${(cash === holding.cash ? ' correct' : `${(holding.cash < cash ? 'under by' : 'over by')} £${Math.abs(holding.cash - cash)}`)}`,
                        user_id: user_id,
                        links: [
                            {table: 'holdings', id: holding.holding_id}
                        ]
                    })
                );
                return Promise.all(actions)
                .then(result => resolve(true))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};