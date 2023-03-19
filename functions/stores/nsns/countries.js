module.exports = function (m, fn) {
    fn.nsns.countries.get = function (where) {
        return fn.get(
            m.nsn_countries,
            where
        );
    };
    fn.nsns.countries.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.nsn_countries.findAndCountAll({
                where: where,
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };
};