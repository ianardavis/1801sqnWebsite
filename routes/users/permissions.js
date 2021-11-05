module.exports = (app, m, fn) => {
    let permission_tree = [
        {permission: 'access_settings'},
        {permission: 'access_users',   children: [
            {permission: 'user_admin'}
        ]},
        {permission: 'edit_own_permissions'},
        {permission: 'access_stores', children: [
            {permission: 'issuer'},
            {permission: 'stores_stock_admin', children: [
                {permission: 'authorised_demander'}
            ]},
            {permission: 'supplier_admin'}
        ]},
        {permission: 'access_canteen', children: [
            {permission: 'pos_user',   children: [
                {permission: 'pos_supervisor'}
            ]},
            {permission: 'canteen_stock_admin'},
            {permission: 'pay_in_out'},
            {permission: 'cash_admin'}
        ]},
        {permission: 'site_functions', children: [
            {permission: 'gallery_admin'}
        ]},
    ];
    function permissions_allowed(user_id, allowed) {
        return new Promise((resolve, reject) => {
            return fn.allowed(user_id, 'edit_own_permissions', true)
            .then(edit_own => {
                if (!allowed && !edit_own) reject(new Error('Permission denied'))
                else resolve(true)
            })
            .catch(err => reject(err));
        });
    };
    app.get('/get/permissions', fn.loggedIn(), fn.permissions.check('user_admin', true), (req, res) => {
        permissions_allowed(req.user.user_id, req.allowed)
        .then(allowed => {
            return m.permissions.findAll({where: req.query})
            .then(permissions => res.send({success: true, result: {permissions: permissions, tree: permission_tree}}))
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    app.put('/permissions/:id', fn.loggedIn(), fn.permissions.check('user_admin', true), (req, res) => {
        permissions_allowed(req.user.user_id, req.allowed)
        .then(allowed => {
            return fn.get(
                'users',
                {user_id: req.params.id}
            )
            .then(user => {
                return m.permissions.findAll({
                    where:      {user_id: user.user_id},
                    attributes: ['permission_id', 'permission']
                })
                .then(permissions => {
                    let actions = [];
                    permissions.forEach(permission => {
                        if (!req.body.permissions.includes(permission.permission)) {
                            actions.push(
                                m.permissions.destroy({where: {permission_id: permission.permission_id}})
                            );
                        };
                    });
                    req.body.permissions.forEach(permission => {
                        actions.push(
                            m.permissions.findOrCreate({
                                where: {
                                    user_id:    user.user_id,
                                    permission: permission
                                }
                            })
                        );
                    });
                    return Promise.allSettled(actions)
                    .then(results => res.send({success: true, message: 'Permissions edited'}))
                    .catch(err => fn.send_error(res, err));
                })
                .catch(err => fn.send_error(res, err));
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
};