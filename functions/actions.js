module.exports = function (m, fn) {
    fn.actions = {};
    fn.actions.create = function (options = {}) {
        return new Promise((resolve, reject) => {
            if      (!options.action)  reject(new Error('No action specified'))
            else if (!options.user_id) reject(new Error('No user specified'))
            else if (!options.links)   reject(new Error('No links specified'))
            else {
                return m.actions.create({
                    action:  options.action,
                    user_id: options.user_id
                })
                .then(action => {
                    let links = [];
                    options.links.forEach(link => {
                        if (link.table && link.id) {
                            links.push(new Promise((resolve, reject) => {
                                return m.action_links.create({
                                    action_id: action.action_id,
                                    _table:    link.table,
                                    id:        link.id
                                })
                                .then(link => resolve(link.action_link_id))
                                .catch(err => reject(err));
                            }));
                        };
                    });
                    Promise.all(links)
                    .then(result => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            };
        });
    };
};