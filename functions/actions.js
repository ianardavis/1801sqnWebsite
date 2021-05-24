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
                        links.push(new Promise((resolve, reject) => {
                            return m.action_links.create({
                                action_id: action.action_id,
                                _table:    link.table,
                                id:        link.id
                            })
                            .then(link => resolve(link.action_link_id))
                            .catch(err => reject(err));
                        }));
                    });
                    Promise.all(links)
                    .then(result => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            };
        });
    };
    fn.actions.migrate_links = function () {
        return new Promise((resolve, reject) => {
            return m.actions.findAll()
            .then(actions => {
                let migrate_actions = [];
                actions.forEach(action => {
                    if (action.issue_id) migrate_actions.push(
                        new Promise((resolve, reject) => {
                            return m.action_links.create({
                                action_id: action.action_id,
                                _table: 'issues',
                                id: action.issue_id
                            })
                            .then(link => {
                                return action.update({issue_id: null})
                                .then(resolve(true))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                    );
                    if (action.order_id) migrate_actions.push(
                        new Promise((resolve, reject) => {
                            return m.action_links.create({
                                action_id: action.action_id,
                                _table: 'orders',
                                id: action.order_id
                            })
                            .then(link => {
                                return action.update({order_id: null})
                                .then(resolve(true))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                    );
                    if (action.stock_id) migrate_actions.push(
                        new Promise((resolve, reject) => {
                            return m.action_links.create({
                                action_id: action.action_id,
                                _table: 'stocks',
                                id: action.stock_id
                            })
                            .then(link => {
                                return action.update({stock_id: null})
                                .then(resolve(true))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                    );
                    if (action.serial_id) migrate_actions.push(
                        new Promise((resolve, reject) => {
                            return m.action_links.create({
                                action_id: action.action_id,
                                _table: 'serials',
                                id: action.serial_id
                            })
                            .then(link => {
                                return action.update({serial_id: null})
                                .then(resolve(true))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                    );
                    if (action.location_id) migrate_actions.push(
                        new Promise((resolve, reject) => {
                            return m.action_links.create({
                                action_id: action.action_id,
                                _table: 'locations',
                                id: action.location_id
                            })
                            .then(link => {
                                return action.update({location_id: null})
                                .then(resolve(true))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                    );
                    if (action.nsn_id) migrate_actions.push(
                        new Promise((resolve, reject) => {
                            return m.action_links.create({
                                action_id: action.action_id,
                                _table: 'nsns',
                                id: action.nsn_id
                            })
                            .then(link => {
                                return action.update({nsn_id: null})
                                .then(resolve(true))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                    );
                    if (action.loancard_line_id) migrate_actions.push(
                        new Promise((resolve, reject) => {
                            return m.action_links.create({
                                action_id: action.action_id,
                                _table: 'loancard_lines',
                                id: action.loancard_line_id
                            })
                            .then(link => {
                                return action.update({loancard_line_id: null})
                                .then(resolve(true))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                    );
                    if (action.demand_line_id) migrate_actions.push(
                        new Promise((resolve, reject) => {
                            return m.action_links.create({
                                action_id: action.action_id,
                                _table: 'demand_lines',
                                id: action.demand_line_id
                            })
                            .then(link => {
                                return action.update({demand_line_id: null})
                                .then(resolve(true))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                    );
                    if (action.demand_id) migrate_actions.push(
                        new Promise((resolve, reject) => {
                            return m.action_links.create({
                                action_id: action.action_id,
                                _table: 'demands',
                                id: action.demand_id
                            })
                            .then(link => {
                                return action.update({demand_id: null})
                                .then(resolve(true))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                    );
                    if (action.loancard_id) migrate_actions.push(
                        new Promise((resolve, reject) => {
                            return m.action_links.create({
                                action_id: action.action_id,
                                _table: 'loancards',
                                id: action.loancard_id
                            })
                            .then(link => {
                                return action.update({loancard_id: null})
                                .then(resolve(true))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                    );
                });
                return Promise.allSettled(migrate_actions)
                .then(results => {
                    console.log(results);
                    resolve(true);
                })
                .catch(err => reject(err))

            })
            .catch(err => reject(err));
        });
    };
};