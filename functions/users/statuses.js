module.exports = function (m, fn) {
    fn.users.statuses.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.statuses.findAndCountAll({
                where: where,
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err =>    reject(err));
        });
    };
};