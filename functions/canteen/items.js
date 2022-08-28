module.exports = function (m, fn) {
    fn.canteen_items = {};
    fn.canteen_items.get = function (item_id) {
        return new Promise((resolve, reject) => {
            m.canteen_items.findOne({
                where: {item_id: item_id}
            })
            .then(item => {
                if (item) resolve(item)
                else reject(new Error('Item not found'));
            })
            .catch(err => reject(err));
        });
    };
    fn.canteen_items.edit = function (item_id, details) {
        return new Promise((resolve, reject) => {
            fn.canteen_items.get(item_id)
            .then(item => {
                item.update(details)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
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

    // DELETE FUNCTIONS
    function check_for_linked_data(item_id) {
        return new Promise((resolve, reject) => {
            Promise.all([
                m.sale_lines.findOne({where: {item_id: item_id}}),
                m.writeoffs .findOne({where: {item_id: item_id}}),
                m.receipts  .findOne({where: {item_id: item_id}})
            ])
            .then(results => {
                if (results.filter(e => !e).length > 0) reject(new Error('This item has linked data and cannot be deleted'))
                else resolve(true);
            })
            .catch(err => reject(err));
        });
    };
    function destroy_item(item) {
        return new Promise((resolve, reject) => {
            Promise.allSettled([
                item.destroy(),
                m.pos_layouts.destroy({where: {item_id: item.item_id}})
            ])
            .then(results => resolve(true))
            .catch(err => reject(err));
        });
    };
    fn.canteen_items.delete = function (item_id) {
        return new Promise((resolve, reject) => {
            fn.canteen_items.get(item_id)
            .then(item => {
                check_for_linked_data(item.item_id)
                .then(results => {
                    destroy_item(item)
                    .then(results => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};