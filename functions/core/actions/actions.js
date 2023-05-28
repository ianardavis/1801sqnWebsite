module.exports = function (m, fn) {
    fn.actions.get = function (where) {
        return fn.get(
            m.actions,
            where,
            [fn.inc.users.user()]
        );
    };
    fn.actions.get_all = function (query) {
        return new Promise((resolve, reject) => {
            m.actions.findAndCountAll({
                include: [{
                    model: m.action_links,
                    as:    'links',
                    where: query.where
                }],
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };

    fn.actions.create = function ([action, user_id, links, return_result = true]) {
        return new Promise((resolve) => {
            m.actions.create({
                action:  action,
                user_id: user_id,
                links:   links
            }, {
                include: [{
                    model: m.action_links,
                    as: 'links'
                }]
            })
            .then(action => resolve(return_result))
            .catch(err => {
                console.error(err);
                resolve(return_result);
            });
        });
    };
};