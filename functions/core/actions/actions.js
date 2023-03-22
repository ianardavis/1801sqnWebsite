module.exports = function (m, fn) {
    fn.actions.get = function (where) {
        return fn.get(
            m.actions,
            where,
            [fn.inc.users.user()]
        );
    };
    fn.actions.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.actions.findAndCountAll({
                include: [{
                    model: m.action_links,
                    as:    'links',
                    where: where
                }],
                ...pagination
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };

    fn.actions.create = function ([action, user_id, links, return_result = null]) {
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
            .then(action => {
                if (return_result) {
                    resolve(return_result);

                } else {
                    resolve(true);

                };
                
            })
            .catch(err => {
                console.log(err);
                if (return_result) {
                    resolve(return_result);

                } else {
                    resolve(true);

                };
            });
        });
    };
};