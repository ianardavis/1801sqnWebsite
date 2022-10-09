module.exports = function (m, fn) {
    fn.actions = {};
    fn.actions.create = function (action, user_id, links) {
        return new Promise((resolve) => {
            m.actions.create({
                action:  action,
                user_id: user_id
            })
            .then(action => {
                let link_actions = [];
                links.forEach(link => {
                    link_actions.push(new Promise((resolve, reject) => {
                        m.action_links.create({
                            action_id: action.action_id,
                            _table:    link.table,
                            id:        link.id
                        })
                        .then(link => resolve(link.action_link_id))
                        .catch(err => {
                            console.log(err);
                            reject(err);
                        });
                    }));
                });
                Promise.allSettled(link_actions)
                .then(result => resolve(true))
                .catch(err => {
                    console.log(err);
                    resolve(false);
                });
            })
            .catch(err => {
                console.log(err);
                resolve(false);
            });
        });
    };
};