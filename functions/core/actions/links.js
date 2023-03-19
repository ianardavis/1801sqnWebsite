module.exports = function (m, fn) {
    fn.actions.links.get = function (where) {
        return fn.get(
            m.action_links,
            where
        );
    };
    fn.actions.links.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.action_links.findAndCountAll({
                where: where,
                ...pagination
            })
            .then(links => resolve(links))
            .catch(err => reject(err));
        });
    };
};