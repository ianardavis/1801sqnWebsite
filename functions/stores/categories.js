module.exports = function (m, fn) {
    fn.categories = {};
    fn.categories.get = function (where) {
        return fn.get(
            m.categories,
            where,
            [fn.inc.stores.categories({as: 'parent'})]
        );
    };
    fn.categories.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.categories.findAndCountAll({
                where:   where || {},
                include: [fn.inc.stores.categories({as: 'parent'})],
                ...pagination
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
    fn.categories.edit = function (category_id, details) {
        return new Promise((resolve, reject) => {
            if (details.parent_category_id === '') details.parent_category_id = null;
            fn.categories.get({category_id: category_id})
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
            fn.categories.get({category_id: category_id})
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