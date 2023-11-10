module.exports = function (m, fn) {
    fn.movements = {};
    fn.movements.find = function (where) {
        return fn.find(
            m.movements,
            where,
            [
                fn.inc.canteen.session(),
                fn.inc.canteen.holding({as: 'holding_to'}),
                fn.inc.canteen.holding({as: 'holding_from'}),
                fn.inc.users.user()
            ]
        );
    };
    fn.movements.findAll = function (query) {
        return new Promise((resolve, reject) => {
            m.movements.findAndCountAll({
                where: query.where,
                include: [
                    fn.inc.canteen.session(),
                    fn.inc.canteen.holding({as: 'holding_to'}),
                    fn.inc.canteen.holding({as: 'holding_from'})
                ],
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
    //
    fn.movements.create = function (movement, user_id) {
        function check(movement) {
            return new Promise((resolve, reject) => {
                if (!movement.holding_id_from) {
                    reject(new Error('No source holding submitted'));
                    
                } else if (!movement.holding_id_to) {
                    reject(new Error('No destination holding submitted'));
                    
                } else if (!movement.description) {
                    reject(new Error('No description submitted'));
                    
                } else if (!movement.amount) {
                    reject(new Error('No amount submitted'));
                    
                } else if ( movement.holding_id_from === movement.holding_id_to) {
                    reject(new Error('Source holding is same as destination holding'));
                    
                } else {
                    resolve(true);
                    
                };
            });
        };
        function getHoldings(holding_id_from, holding_id_to) {
            return new Promise((resolve, reject) => {
                Promise.all([
                    fn.holdings.find({holding_id: holding_id_from}),
                    fn.holdings.find({holding_id: holding_id_to})
                ])
                .then(results => resolve([results[0], results[1]]))
                .catch(reject);
            });
        };
        function transferCash(holding_from, holding_to, amount) {
            return new Promise((resolve, reject) => {
                if (holding_from.cash < Number(amount)) {
                    reject(new Error('Not enough cash in source holding'));
                } else {
                    return Promise.all([
                        holding_from.decrement('cash', {by: amount}),
                        holding_to  .increment('cash', {by: amount})
                    ])
                    .then(result => resolve(true))
                    .catch(reject);
                };
            });
        };
        function createMovementRecord(movement, user_id) {
            return new Promise((resolve, reject) => {
                m.movements.create({
                    ...movement,
                    type: 'Cash',
                    user_id: user_id
                })
                .then(movement => resolve(true))
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            if (movement) {
                check(movement)
                .then(result => {
                    getHoldings(movement.holding_id_from, movement.holding_id_to)
                    .then(([holding_from, holding_to]) => {
                        transferCash(holding_from, holding_to, movement.amount)
                        .then(result => {
                            createMovementRecord(movement, user_id)
                            .then(result => resolve(true))
                            .catch(err => {
                                console.error(err);
                                resolve(true);
                            });
                        })
                        .catch(reject);
                    })
                    .catch(reject);
                })
                .catch(reject);
            } else {
                reject(new Error('No details'));
                
            };
        });
    };
    //
};