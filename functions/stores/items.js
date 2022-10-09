module.exports = function (m, fn) {
    fn.items = {};
    fn.items.get = function (item_id) {
        return new Promise((resolve, reject) => {
            m.items.findOne({where: {item_id: item_id}})
            .then(item => {
                if (item) resolve(item)
                else reject(new Error('Item not found'));
            })
            .catch(err => reject(err));
        });
    };
    fn.items.edit = function (item_id, details) {
        return new Promise((resolve, reject) => {
            fn.items.get(item_id)
            .then(item => {
                item.update(details)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};