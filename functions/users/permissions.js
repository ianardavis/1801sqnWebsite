module.exports = function (m, fn) {
    function permissions_allowed(user_id, allowed) {
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
    fn.users.permissions.get_all = function (user_id, allowed, where, pagination) {
        return new Promise((resolve, reject) => {
            permissions_allowed(user_id, allowed)
            .then(allowed => {
                m.permissions.findAndCountAll({
                    where: where,
                    ...pagination
                })
                .then(results => resolve(results))
                .catch(reject);
            })
            .catch(reject);
        });
    };
    fn.users.permissions.update = function (user_id_self, user_id, allowed, submitted_permissions) {
        return new Promise((resolve, reject) => {
            permissions_allowed(user_id_self, allowed)
            .then(allowed => {
                fn.users.get({user_id: user_id})
                .then(user => {
                    m.permissions.findAll({
                        where:      {user_id: user.user_id},
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
};