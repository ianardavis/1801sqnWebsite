const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    let permission_tree = [
        {_permission: 'access_canteen',           children: [
            {_permission: 'access_pos'},
            {_permission: 'access_credits',       children: [
                {_permission: 'credit_add'},
                {_permission: 'credit_edit'},
                {_permission: 'credit_delete'}
            ]},
            {_permission: 'access_holdings',      children: [
                {_permission: 'holding_add'},
                {_permission: 'holding_edit'},
                {_permission: 'holding_delete'}
            ]},
            {_permission: 'access_items',         children: [
                {_permission: 'item_add'},
                {_permission: 'item_edit'},
                {_permission: 'item_delete'}
            ]},
            {_permission: 'access_movements',     children: [
                {_permission: 'movement_add'},
                {_permission: 'movement_edit'},
                {_permission: 'movement_delete'},
                {_permission: 'pay_out'},
                {_permission: 'pay_in'}
            ]},
            {_permission: 'access_notes',         children: [
                {_permission: 'note_add'},
                {_permission: 'note_edit'},
                {_permission: 'note_delete'}
            ]},
            {_permission: 'access_notifications', children: [
                {_permission: 'notification_add'},
                {_permission: 'notification_edit'},
                {_permission: 'notification_delete'}
            ]},
            {_permission: 'access_payments'},
            {_permission: 'access_permissions',   children: [
                {_permission: 'permission_edit'}
            ]},
            {_permission: 'access_pos_layouts',   children: [
                {_permission: 'pos_layout_add'},
                {_permission: 'pos_layout_edit'},
                {_permission: 'pos_layout_delete'}
            ]},
            {_permission: 'access_pos_pages',     children: [
                {_permission: 'pos_page_add'},
                {_permission: 'pos_page_edit'},
                {_permission: 'pos_page_delete'}
            ]},
            {_permission: 'access_receipts',      children: [
                {_permission: 'receipt_add'},
                {_permission: 'receipt_edit'},
                {_permission: 'receipt_delete'},
                {_permission: 'access_receipt_lines', children: [
                    {_permission: 'receipt_line_add'},
                    {_permission: 'receipt_line_delete'}
                ]}
            ]},
            {_permission: 'access_sales',         children: [
                {_permission: 'access_sale_lines'}
            ]},
            {_permission: 'access_sessions',      children: [
                {_permission: 'session_add'},
                {_permission: 'session_edit'},
                {_permission: 'session_delete'}
            ]},
            {_permission: 'access_settings',      children: [
                {_permission: 'setting_add'},
                {_permission: 'setting_edit'},
                {_permission: 'setting_delete'}
            ]},
            {_permission: 'access_writeoffs',     children: [
                {_permission: 'writeoff_add'},
                {_permission: 'writeoff_edit'},
                {_permission: 'writeoff_delete'},
                {_permission: 'access_writeoff_lines', children: [
                    {_permission: 'writeoff_line_add'},
                    {_permission: 'writeoff_line_delete'}
                ]}
            ]},
            {_permission: 'access_users'}
        ]}
    ];
    app.get('/canteen/get/permissions',    permissions, allowed('access_permissions', {send: true}), (req, res) => {
        m.permissions.findAll({
            where: req.query,
            attributes: ['permission_id', '_permission', 'createdAt']
        })
        .then(permissions => res.send({result: true, permissions: {permissions: permissions, tree: permission_tree}}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/canteen/permissions/:id',    permissions, allowed('permission_edit',    {send: true}), (req, res) => {
        m.users.findOne({
            where: {user_id: req.params.id},
            attributes: ['user_id']
        })
        .then(user => {
            if (user.user_id === req.user.user_id) res.send({result: false, message: 'You can not edit your own permissions'})
            else {
                return m.permissions.findAll({
                    where: {user_id: user.user_id},
                    attributes: ['permission_id', '_permission']
                })
                .then(permissions => {
                    let actions = [];
                    permissions.forEach(permission => {
                        if (!req.body.permissions.includes(permission._permission)) {
                            actions.push(
                                m.permissions.destroy({where: {permission_id: permission.permission_id}})
                            );
                        }
                    });
                    req.body.permissions.forEach(permission => {
                        actions.push(
                            m.permissions.findOrCreate({
                                where: {
                                    user_id: user.user_id,
                                    _permission: permission
                                }
                            })
                        );
                    });
                    return Promise.allSettled(actions)
                    .then(results => {
                        console.log(results);
                        res.send({result: true, message: 'Permissions edited'});
                    })
                    .catch(err => res.error.send(err, res));
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
};