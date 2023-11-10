module.exports = function (m, fn) {
    fn.users.statuses.findAll = function (query) {
        return new Promise((resolve, reject) => {
            m.statuses.findAndCountAll({
                where: query.where,
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
};