module.exports = function (m, fn) {
    fn.suppliers = {};
    fn.suppliers.get = function (supplier_id) {
        return fn.get('suppliers', {supplier_id: supplier_id})
    };
};