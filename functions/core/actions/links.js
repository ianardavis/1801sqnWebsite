module.exports = function (m, fn) {
    fn.actions.links.get = function (where) {
        return fn.get(
            m.action_links,
            where
        );
    };
    fn.actions.links.get_all = function (query) {
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