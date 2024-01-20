module.exports = function (m, fn) {
    function permissionsAllowed(user_id, allowed) {
        return new Promise((resolve, reject) => {
            fn.allowed(user_id, 'edit_own_permissions', true)
            .then(edit_own => {
                if (!allowed && !edit_own) {
                    reject(new Error('Permission denied'));

                } else {
                    resolve(true);
                
                };
            })
            .catch(reject);
        });
    };
    fn.users.permissions.get_all = function (user_id, allowed, query) {
        return new Promise((resolve, reject) => {
            permissionsAllowed(user_id, allowed)
            .then(allowed => {
                m.permissions.findAndCountAll({
                    where: query.where,
                    ...fn.pagination(query)
                })
                .then(results => resolve(results))
                .catch(reject);
            })
            .catch(reject);
        });
    };
    fn.users.permissions.update = function (site_id, user_id_self, user_id, allowed, submitted_permissions) {
        return new Promise((resolve, reject) => {
            permissionsAllowed(user_id_self, allowed)
            .then(allowed => {
                fn.users.find({user_id: user_id})
                .then(user => {
                    m.permissions.findAll({
                        where:      {
                            user_id: user.user_id,
                            site_id: site_id
                        },
                        attributes: ['permission_id', 'permission']
                    })
                    .then(permissions => {
                        let actions = [];
                        permissions.forEach(permission => {
                            if (!submitted_permissions.includes(permission.permission)) {
                                actions.push(
                                    m.permissions.destroy({where: {permission_id: permission.permission_id}})
                                );
                            };
                        });
                        submitted_permissions.forEach(permission => {
                            actions.push(
                                m.permissions.findOrCreate({
                                    where: {
                                        user_id:    user.user_id,
                                        site_id:    site_id,
                                        permission: permission
                                    }
                                })
                            );
                        });
                        Promise.allSettled(actions)
                        .then(results => resolve(true))
                        .catch(reject);
                    })
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };
    fn.users.permissions.tree = function () {
        return [
            { permission: 'site_admin' },
            { permission: 'access_settings' },
            { permission: 'access_users',   children: [
                { permission: 'user_admin' }
            ]},
            { permission: 'edit_own_permissions' },
            { permission: 'access_stores', children: [
                { permission: 'issuer' },
                { permission: 'stores_stock_admin', children: [
                    { permission: 'authorised_demander' }
                ]},
                { permission: 'supplier_admin' }
            ] },
            { permission: 'access_canteen', children: [
                { permission: 'pos_user',   children: [
                    { permission: 'pos_supervisor' }
                ]},
                { permission: 'canteen_stock_admin' },
                { permission: 'pay_in_out' },
                { permission: 'cash_admin' }
            ]}
        ];
    };
};