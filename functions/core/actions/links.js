module.exports = function (m, fn) {
    fn.actions.links.find = function (where) {
        return fn.find(
            m.action_links,
            where
        );
    };
    fn.actions.links.findAll = function (query) {
        return new Promise((resolve, reject) => {
            m.action_links.findAndCountAll({
                where: query.where,
                ...fn.pagination(query)
            })
            .then(links => resolve(links))
            .catch(reject);
        });
    };
};