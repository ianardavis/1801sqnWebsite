module.exports = function (m, fn) {
    fn.nsns.classes.get = function (where) {
        return fn.get(
            m.nsn_classes,
            where
        );
    };
    fn.nsns.classes.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            if (query.nsn_group_id === '') query.nsn_group_id = null;
            m.nsn_classes.findAndCountAll({
                where: where,
                ...pagination
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
};