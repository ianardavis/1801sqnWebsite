module.exports = function (m, fn) {
    fn.nsns.countries.get = function (where) {
        return fn.get(
            m.nsn_countries,
            where
        );
    };
    fn.nsns.countries.get_all = function (query) {
        return new Promise((resolve, reject) => {
            m.nsn_countries.findAndCountAll({
                where: query.where,
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
};