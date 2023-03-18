module.exports = function (m, fn) {
    fn.nsns.countries.get = function (nsn_country_id) {
        return new Promise((resolve, reject) => {
            m.nsn_countries.findOne({where: {nsn_country_id: nsn_country_id}})
            .then(nsn_class => {
                if (nsn_class) {
                    resolve(nsn_class);

                } else {
                    reject(new Error('Country not found'));
                };
            })
            .catch(err => reject(err));
        });
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