module.exports = function (m, fn) {
    fn.categories = {};
    fn.categories.find = function (where) {
        return fn.find(
            m.categories,
            where,
            [fn.inc.stores.categories({as: 'parent'})]
        );
    };
    fn.categories.findAll = function (query) {
        return m.categories.findAndCountAll({
            where:   query.where || {},
            include: [fn.inc.stores.categories({as: 'parent'})],
            ...fn.pagination(query)
        });
    };
    fn.categories.edit = function (category_id, details) {
        return new Promise((resolve, reject) => {
            if (details.parent_category_id === '') details.parent_category_id = null;
            fn.categories.find({category_id: category_id})
            .then(category => {
                fn.update(category, details)
                .then(result => resolve(true))
                .catch(reject);
            })
            .catch(reject);
        });
    };
    fn.categories.create = function (category, user_id) {
        return new Promise((resolve, reject) => {
            if (category.parent_category_id === '') delete category.parent_category_id;
            m.categories.create({...category, ...{user_id: user_id}})
            .then(category => resolve(true))
            .catch(reject);
        });
    };
    fn.categories.delete = function (category_id) {
        return new Promise((resolve, reject) => {
            fn.categories.find({category_id: category_id})
            .then(category => {
                m.item_categories.destroy(
                    {where: {category_id: category.category_id}}
                )
                .then(result => {
                    category.destroy()
                    .then(result => {
                        if (result) {
                            resolve(true);

                        } else {
                            reject(new Error('Category not deleted'));

                        };
                    })
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };
};