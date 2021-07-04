module.exports = function (m, fn) {
    fn.movements = {};
    fn.movements.create = function (movement, user_id) {
        return new Promise((resolve, reject) => {
            if      (!movement.holding_id_from)                           reject(new Error('No source holding submitted'))
            else if (!movement.holding_id_to)                             reject(new Error('No destination holding submitted'))
            else if (!movement.description)                               reject(new Error('No description submitted'))
            else if (!movement.amount)                                    reject(new Error('No amount submitted'))
            else if (movement.holding_id_from === movement.holding_id_to) reject(new Error('Source holding is same as destination holding'))
            else {
                fn.get(
                    'holdings',
                    {holding_id: movement.holding_id_from}
                )
                .then(holding_from => {
                    if (holding_from.cash < Number(movement.amount)) reject(new Error('Not enough cash in source holding'))
                    else {
                        fn.get(
                            'holdings',
                            {holding_id: movement.holding_id_to}
                        )
                        .then(holding_to => {
                            return Promise.all([
                                holding_from.decrement('cash', {by: movement.amount}),
                                holding_to  .increment('cash', {by: movement.amount})
                            ])
                            .then(result => {
                                return m.movements.create({
                                    ...movement,
                                    type: 'Cash',
                                    user_id: user_id
                                })
                                .then(movement => resolve(true))
                                .catch(err => {
                                    console.log(err);
                                    resolve(true);
                                })
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            };
        });
    };
};