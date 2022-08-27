module.exports = function (m, fn) {
    fn.categories = {};
    fn.categories.get = function (category_id) {
        return new Promise((resolve, reject) => {
            m.categories.findOne({where: {category_id: category_id}})
            .then(category => {
                if (category) resolve(category)
                else reject(new Error('Category not found'));
            })
            .catch(err => reject(err));
        });
    };
    fn.categories.edit = function (category_id, details) {
        return new Promise((resolve, reject) => {
            fn.categories.get(category_id)
            .then(category => {
                category.update(details)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};