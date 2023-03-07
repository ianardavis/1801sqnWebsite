module.exports = function (m, fn) {
    fn.movements = {};
    fn.movements.get = function (where) {
        return new Promise((resolve, reject) => {
            m.movements.findOne({
                where: where,
                include: [
                    fn.inc.canteen.session(),
                    fn.inc.canteen.holding({as: 'holding_to'}),
                    fn.inc.canteen.holding({as: 'holding_from'}),
                    fn.inc.users.user()
                ]
            })
            .then(movements => resolve(movements))
            .catch(err => reject(err));
        });
    };
    fn.movements.getAll = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.movements.findAndCountAll({
                where: where,
                include: [
                    fn.inc.canteen.session(),
                    fn.inc.canteen.holding({as: 'holding_to'}),
                    fn.inc.canteen.holding({as: 'holding_from'})
                ],
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };
    //
    function check_movement(movement) {
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
    function get_holdings(holding_id_from, holding_id_to) {
        return new Promise((resolve, reject) => {
            Promise.all([
                fn.holdings.get({holding_id: holding_id_from}),
                fn.holdings.get({holding_id: holding_id_to})
            ])
            .then(results => resolve([results[0], results[1]]))
            .catch(err => reject(err));
        });
    };
    function transfer_cash(holding_from, holding_to, amount) {
        return new Promise((resolve, reject) => {
            if (holding_from.cash < Number(amount)) {
                reject(new Error('Not enough cash in source holding'));
            } else {
                return Promise.all([
                    holding_from.decrement('cash', {by: amount}),
                    holding_to  .increment('cash', {by: amount})
                ])
                .then(result => resolve(true))
                .catch(err => reject(err));
            };
        });
    };
    function create_movement_record(movement, user_id) {
        return new Promise((resolve, reject) => {
            m.movements.create({
                ...movement,
                type: 'Cash',
                user_id: user_id
            })
            .then(movement => resolve(true))
            .catch(err => reject(err));
        });
    };
    fn.movements.create = function (movement, user_id) {
        return new Promise((resolve, reject) => {
            if (movement) {
                check_movement(movement)
                .then(result => {
                    get_holdings(movement.holding_id_from, movement.holding_id_to)
                    .then(([holding_from, holding_to]) => {
                        transfer_cash(holding_from, holding_to, movement.amount)
                        .then(result => {
                            create_movement_record(movement, user_id)
                            .then(result => resolve(true))
                            .catch(err => {
                                console.log(err);
                                resolve(true);
                            });
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            } else {
                reject(new Error('No details'));
                
            };
        });
    };
    //
};