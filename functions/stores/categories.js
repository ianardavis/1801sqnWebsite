module.exports = function (m, fn) {
    fn.categories = {};
    fn.categories.get = function (category_id) {
        return new Promise((resolve, reject) => {
            m.categories.findOne({where: {category_id: category_id}})
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
    fn.categories.edit = function (category_id, details) {
        return new Promise((resolve, reject) => {
            if (details.parent_category_id === '') details.parent_category_id = null;
            fn.categories.get(category_id)
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
            fn.categories.get(category_id)
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