module.exports = function (m, fn) {
    fn.users.ranks.get_all = function (query) {
        return new Promise((resolve, reject) => {
            m.ranks.findAndCountAll({
                where: query.where,
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
};