module.exports = function (m, fn) {
    fn.canteen_items = {};
    fn.canteen_items.get = function (where) {
        return fn.get(
            m.canteen_items,
            where
        );
    };
    fn.canteen_items.get_all = function (query) {
        return new Promise((resolve, reject) => {
            m.canteen_items.findAndCountAll({
                where: query.where,
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
    fn.canteen_items.get_by_EAN = function (ean) {
        return new Promise((resolve, reject) => {
            m.eans.findOne({
                where: {ean: ean},
                include: [fn.inc.canteen.item()]
            })
            .then(_ean => {
                if (_ean) {
                    if (_ean.item) {
                        resolve(_ean.item);

                    } else {
                        reject(new Error('No item for this EAN'));

                    };

                } else {
                    reject(new Error('EAN not found'));
                    
                }
            })
            .catch(reject);
        });
    };

    fn.canteen_items.edit = function (item_id, details) {
        return new Promise((resolve, reject) => {
            fn.canteen_items.get({item_id: item_id})
            .then(item => {
                fn.update(item, details)
                .then(result => resolve(result))
                .catch(reject);
            })
            .catch(reject);
        });
    };
    fn.canteen_items.create = function (item) {
        return new Promise((resolve, reject) => {
            if (item) {
                m.canteen_items.create(item)
                .then(item => resolve(true))
                .catch(reject);

            } else {
                reject(new Error('No item'));

            };
        });
    };

    fn.canteen_items.delete = function (item_id) {
        function check_for_linked_data(item_id) {
            return new Promise((resolve, reject) => {
                Promise.all([
                    m.sale_lines.findOne({where: {item_id: item_id}}),
                    m.writeoffs .findOne({where: {item_id: item_id}}),
                    m.receipts  .findOne({where: {item_id: item_id}})
                ])
                .then(results => {
                    if (results.filter(e => !e).length > 0) {
                        reject(new Error('This item has linked data and cannot be deleted'));
                        
                    } else {
                        resolve(true);
                        
                    };
                })
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            fn.canteen_items.get({item_id: item_id})
            .then(item => {
                check_for_linked_data(item.item_id)
                .then(item.destroy)
                .then(results => resolve(true))
                .catch(reject);
            })
            .catch(reject);
        });
    };
};