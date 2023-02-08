module.exports = function (m, fn) {
    fn.actions = {};
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
};