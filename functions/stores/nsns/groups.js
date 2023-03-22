module.exports = function (m, fn) {
    fn.nsns.groups.get = function (where) {
        return fn.get(
            m.nsn_groups,
            where
        );
    };
    fn.nsns.groups.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.nsn_groups.findAndCountAll({
                where: where,
                ...pagination
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
};