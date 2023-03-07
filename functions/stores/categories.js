module.exports = function (m, fn) {
    fn.categories = {};
    fn.categories.get = function (where) {
        return new Promise((resolve, reject) => {
            m.categories.findOne({
                where: where,
                include: [fn.inc.stores.categories({as: 'parent'})]
            })
            .then(category => {
                if (category) {
                    resolve(category);

                } else {
                    reject(new Error('Category not found'));

                };
            })
            .catch(err => reject(err));
        });
    };
    fn.categories.getAll = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.categories.findAndCountAll({
                where:   where || {},
                include: [fn.inc.stores.categories({as: 'parent'})],
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };
    fn.categories.edit = function (category_id, details) {
        return new Promise((resolve, reject) => {
            if (details.parent_category_id === '') details.parent_category_id = null;
            fn.categories.get({category_id: category_id})
            .then(category => {
                category.update(details)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.categories.create = function (category, user_id) {
        return new Promise((resolve, reject) => {
            if (category.parent_category_id === '') delete category.parent_category_id;
            m.categories.create({...category, ...{user_id: user_id}})
            .then(category => resolve(true))
            .catch(err => reject(err));
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
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};