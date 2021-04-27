module.exports = function(fn) {
    fn.counter = function () {
        let count = 0;
        return () => {
            return ++count;
        };
    };
};