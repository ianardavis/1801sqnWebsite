module.exports = function (m, fn) {
    fn.items.categories.find = function (where) {
        return fn.find(
            m.item_categories,
            where,
            [m.categories]
        );
    };
    fn.items.categories.findAll = function (query) {
        return new Promise((resolve, reject) => {
            m.item_categories.findAndCountAll({
                where:   query.where,
                include: [fn.inc.stores.category()],
                ...fn.pagination(query)
            })
            .then(categories => resolve(categories))
            .catch(reject);
        });
    };

    fn.items.categories.create = function (item_id, category_id) {
        return new Promise((resolve, reject) => {
            Promise.all([
                m.items     .findOne({where: {item_id:     item_id}}),
                m.categories.findOne({where: {category_id: category_id}})
            ])
            .then(([item, category]) => {
                if (item && category) {
                    m.item_categories.findOrCreate({
                        where: {
                            item_id:     item_id,
                            category_id: category_id
                        }
                    })
                    .then(([category, created]) => resolve(true))
                    .catch(reject);

                } else {
                    reject(new Error(`Item or category not found`));

                };
            })
            .catch(reject);
        });
    };
    fn.items.categories.delete = function (item_category_id) {
        return new Promise((resolve, reject) => {
            m.item_categories.destroy({where: {item_category_id: item_category_id}})
            .then(result => {
                if (result) {
                    resolve(true);

                } else {
                    reject(new Error('Category not deleted'));

                };
            })
            .catch(reject);
        });
    };
};