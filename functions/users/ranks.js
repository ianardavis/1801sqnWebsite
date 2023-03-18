module.exports = function (m, fn) {
    fn.users.ranks.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.ranks.findAndCountAll({
                where: where,
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };
};