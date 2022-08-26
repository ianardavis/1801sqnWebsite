module.exports = function (m, fn) {
    fn.canteen_items = {};
    fn.canteen_items.get = function (item_id) {
        return new Promise((resolve, reject) => {
            m.canteen_items.findOne({
                where: {item_id: item_id}
            })
            .then(item => resolve(item))
            .catch(err => reject(err));
        });
    };
    fn.canteen_items.create = function (item) {
        return new Promise((resolve, reject) => {
            m.canteen_items.create(item)
            .then(item => resolve(true))
            .catch(err => reject(err));
        });
    };
    fn.canteen_items.delete = function (item_id) {
        return new Promise((resolve, reject) => {
            fn.canteen_items.get(item_id)
            .then(item => {
                let actions = [];
                ['sale_lines', 'writeoffs', 'receipts'].forEach(e => actions.push(fn.get(e, {item_id: item.item_id})));
                Promise.allSettled(actions)
                .then(results => {
                    if (results.filter(e => e.status === 'fulfilled' && e.value).length > 0) reject(new Error('This item has linked data and cannot be deleted'))
                    else {
                        Promise.allSettled([
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