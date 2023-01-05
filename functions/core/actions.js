module.exports = function (m, fn) {
    fn.actions = {};
    fn.actions.create = function (action, user_id, links) {
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
            .then(action => resolve(true))
            .catch(err => {
                console.log(err);
                resolve(false);
            });
        });
    };
};