module.exports = function (m, fn) {
    fn.categories = {};
    fn.categories.get = function (category_id) {
        return fn.get('categories', {category_id: category_id})
    };
};