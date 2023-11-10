module.exports = function (m, fn) {
    fn.writeoffs = {};
    fn.writeoffs.find = function (where) {
        return fn.find(
            m.writeoffs,
            where,
            [
                fn.inc.users.user(),
                fn.inc.canteen.item()
            ]
        );
    };
    fn.writeoffs.findAll = function (query) {
        return new Promise((resolve, reject) => {
            m.writeoffs.findAndCountAll({
                where: query.where,
                include: [
                    fn.inc.users.user(),
                    fn.inc.canteen.item()
                ],
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
    fn.writeoffs.create = function (writeoff, user_id) {
        function check(writeoff) {
            return new Promise((resolve, reject) => {
                if (!writeoff.reason) {
                    reject(new Error('No reason'));
    
                } else if (!writeoff.qty) {
                    reject(new Error('No quantity'));
    
                } else if (!writeoff.item_id) {
                    reject(new Error('No item ID'));
    
                } else {
                    resolve(true);
    
                };
            });
        };
        return new Promise((resolve, reject) => {
            if (writeoff) {
                check(writeoff)
                .then(result => {
                    fn.canteen_items.find({item_id: writeoff.item_id})
                    .then(item => {
                        item.decrement('qty', {by: writeoff.qty})
                        .then(result => {
                            m.writeoffs.create({
                                ...writeoff,
                                cost:    item.cost,
                                user_id: user_id
                            })
                            .then(writeoff => resolve(true))
                            .catch(reject);
                        })
                        .catch(reject);
                    })
                    .catch(reject);
                })
                .catch(reject);

            } else {
                reject(new Error('No writeoff'));

            };
        });
    };
};