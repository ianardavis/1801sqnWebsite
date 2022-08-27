module.exports = function (m, fn) {
    fn.writeoffs = {};
    fn.writeoffs.create = function (writeoff, user_id) {
        return new Promise((resolve, reject) => {
            if      (!writeoff.reason)  reject(new Error('No reason'))
            else if (!writeoff.qty)     reject(new Error('No quantity'))
            else if (!writeoff.item_id) reject(new Error('No item ID'))
            else {
                fn.canteen_items.get(writeoff.item_id)
                .then(item => {
                    item.decrement('qty', {by: writeoff.qty})
                    .then(result => {
                        m.writeoffs.create({
                            ...writeoff,
                            cost:    item.cost,
                            user_id: user_id
                        })
                        .then(writeoff => resolve(true))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            };
        });
    };
};