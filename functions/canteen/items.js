module.exports = function (m, fn) {
    fn.canteen_items = {};
    fn.canteen_items.create = function (item) {
        return new Promise((resolve, reject) => {
            return m.canteen_items.create(item)
            .then(item => resolve(true))
            .catch(err => reject(err));
        });
    };
    fn.canteen_items.delete = function (item_id) {
        return new Promise((resolve, reject) => {
            return fn.get(
                'canteen_items',
                {item_id: item_id}
            )
            .then(item => {
                let actions = [];
                ['sale_lines', 'writeoffs', 'receipts'].forEach(e => actions.push(fn.get(e, {item_id: item.item_id})));
                return Promise.allSettled(actions)
                .then(results => {
                    if (results.filter(e => e.status === 'fulfilled' && e.value).length > 0) reject(new Error('This item has linked data and cannot be deleted'))
                    else {
                        return Promise.allSettled([
                            item.destroy(),
                            m.pos_layouts.destroy({where: {item_id: item.item_id}})
                        ])
                        .then(results => resolve(true))
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};