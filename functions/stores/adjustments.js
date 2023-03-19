module.exports = function (m, fn) {
    fn.adjustments = {};
    fn.adjustments.get = function (where) {
        return fn.get(
            m.adjustments,
            where
        );
    };
};