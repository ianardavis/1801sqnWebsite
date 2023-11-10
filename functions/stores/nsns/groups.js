module.exports = function (m, fn) {
    fn.nsns.groups.find = function (where) {
        return fn.find(
            m.nsn_groups,
            where
        );
    };
    fn.nsns.groups.findAll = function (query) {
        return new Promise((resolve, reject) => {
            m.nsn_groups.findAndCountAll({
                where: query.where,
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
};