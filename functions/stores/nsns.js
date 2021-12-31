module.exports = function (m, fn) {
    fn.nsns = {};
    fn.nsns.get = function (nsn_id) {
        return fn.get(
            'nsns',
            {nsn_id: nsn_id}
        )
    };
};