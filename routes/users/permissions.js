module.exports = (app, fn) => {
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
    app.get('/get/permissions', fn.loggedIn(), fn.permissions.check('user_admin', true), (req, res) => {
        fn.users.permissions.getAll(
            req.user.user_id,
            req.allowed,
            req.query.where,
            fn.pagination(req.query)
        )
        .then(results => {
            fn.send_res('permissions', res, results, req.query, [{name: 'tree', obj: permission_tree}]);
        })
        .catch(err => fn.send_error(res, err));
    });
    app.put('/permissions/:id', fn.loggedIn(), fn.permissions.check('user_admin', true), (req, res) => {
        fn.users.permissions.update(req.user.user_id, req.params.id, req.allowed, req.body.permissions)
        .then(results => res.send({success: true, message: 'Permissions edited'}))
        .catch(err => fn.send_error(res, err));
    });
};