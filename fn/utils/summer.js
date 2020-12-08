module.exports = function(items) {
    if (items == null) return 0;
    return items.reduce((a, b) => {
        return b['_qty'] == null ? a : a + b['_qty'];
    }, 0);
};