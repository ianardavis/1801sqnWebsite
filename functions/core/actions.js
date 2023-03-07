module.exports = function (m, fn) {
    fn.actions = {links: {}};
    fn.actions.get = function (where) {
        return new Promise((resolve, reject) => {
            m.actions.findOne({
                where:   where,
                include: [fn.inc.users.user()]
            })
            .then(action => {
                if (action) {
                    resolve(action);

                } else {
                    reject(new Error('Action not found'));

                };
            })
            .catch(err => reject(err));
        });
    };
    fn.actions.getAll = function (where, pagination) {
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
            .catch(err => reject(err));
        });
    };

    fn.actions.create = function (action, user_id, links, return_result = null) {
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

    fn.actions.links.get = function (where) {
        return new Promise((resolve, reject) => {
            m.action_links.findOne({
                where: where
            })
            .then(link => {
                if (link) {
                    resolve(link);
    
                } else {
                    reject(new Error('Link not found'));
                
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.actions.links.getAll = function (where, pagination) {
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