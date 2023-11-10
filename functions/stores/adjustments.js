module.exports = function (m, fn) {
    fn.adjustments = {};
    fn.adjustments.find = function (where) {
        return fn.find(
            m.adjustments,
            where
        );
    };
};