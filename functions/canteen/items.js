module.exports = function (m, fn) {
    fn.canteen_items = {};
    fn.canteen_items.create = function (item) {
        return new Promise((resolve, reject) => {
            m.canteen_items.create(item)
            .then(item => resolve(true))
            .catch(err => reject(err));
        });
    };
    fn.canteen_items.edit = function (item_id, _item) {
        return new Promise((resolve, reject) => {
            fn.get(
                'canteen_items',
                {item_id: item_id}
            )
            .then(item => {
                return item.update(_item)
                .then(result => {
                    if (result) resolve(true)
                    else        reject(new Error('Item not updated'))
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.canteen_items.delete = function (item_id) {
        return new Promise((resolve, reject) => {
            fn.get(
                'canteen_items',
                {item_id: req.params.id}
            )
            .then(item => {
                item.destroy()
                .then(result => {
                    if (result) resolve(true)
                    else        reject(new Error('Item not deleted'));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};