module.exports = (app, allowed, inc, permissions, m) => {
    let permission_tree = [
        {_permission: 'access_stores',           children: [
            {_permission: 'access_accounts',       children: [
                {_permission: 'accountt_add'},
                {_permission: 'account_edit'},
                {_permission: 'account_delete'}
            ]},
            {_permission: 'access_adjusts',      children: [
                {_permission: 'adjust_add'},
                {_permission: 'adjust_edit'},
                {_permission: 'adjust_delete'}
            ]},
            {_permission: 'access_categories',      children: [
                {_permission: 'category_add'},
                {_permission: 'category_edit'},
                {_permission: 'category_delete'}
            ]},
            {_permission: 'access_demands',      children: [
                {_permission: 'demand_add'},
                {_permission: 'demand_edit'},
                {_permission: 'demand_delete'},
                {_permission: 'access_demand_lines', children: [
                    {_permission: 'demand_line_add'},
                    {_permission: 'demand_line_edit'},
                    {_permission: 'demand_line_delete'}
                ]}
            ]},
            {_permission: 'access_files',      children: [
                {_permission: 'file_add'},
                {_permission: 'file_edit'},
                {_permission: 'file_delete'}
            ]},
            {_permission: 'access_genders',      children: [
                {_permission: 'gender_add'},
                {_permission: 'gender_edit'},
                {_permission: 'gender_delete'}
            ]},
            {_permission: 'access_groups',      children: [
                {_permission: 'group_add'},
                {_permission: 'group_edit'},
                {_permission: 'group_delete'}
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
    app.get('/stores/permissions/:id/edit', permissions, allowed('permission_edit'),                  (req, res) => {
        if (Number(req.params.id) === req.user.user_id && Number(req.params.id) !== 2) {
            res.error.redirect(new Error('You can not edit your own permissions'), req, res);
        } else if (Number(req.params.id) === 1) {
            res.error.redirect(new Error('You can not edit the Admin user permissions'), req, res);
        } else {
            m.users.findOne({
                where: {user_id: req.params.id},
                include: [
                    m.ranks,
                    {model: m.permissions, attributes: {exclude: ['createdAt', 'updatedAt', 'user_id']}}
                ]
            })
            .then(user => {
                let attributes = [];
                for (let attribute in m.permissions.rawAttributes) {
                    if (!m.permissions.rawAttributes.hasOwnProperty(attribute)) continue;
                    let obj = m.permissions.rawAttributes[attribute];
                    if (obj.fieldName !== 'user_id' && obj.fieldName !== 'createdAt' && obj.fieldName !== 'updatedAt') {
                        attributes.push(JSON.stringify({name: obj.fieldName, parent: obj.comment}))
                    };
                };
                res.render('stores/permissions/edit', {
                    f_user:     user,
                    attributes: attributes
                });
            })
            .catch(err => res.error.redirect(err, req, res));
        };
    });
    
    app.get('/stores/get/permissions',      permissions, allowed('access_permissions', {send: true}), (req, res) => {
        m.permissions.findAll({
            where:      req.query,
            attributes: ['_permission']
        })
        .then(permissions => res.send({result: true, permissions: permissions}))
        .catch(err => res.error.send(err, res));
    });

    app.put('/stores/permissions/:id',      permissions, allowed('permission_edit',    {send: true}), (req, res) => {
        if (Number(req.params.id) !== req.user.user_id || Number(req.params.id) === 2) {
            if (Number(req.params.id) !== 1) {
                m.permissions.findAll({
                    where: {user_id: req.params.id},
                    attributes: ['permission_id', '_permission']
                })
                .then(permissions => {
                    let actions = [];
                    req.body.permissions.forEach(permission => {
                        if (permissions.filter(e => e._permission === permission).length === 0) {
                            actions.push(
                                m.permissions.create({
                                    user_id: req.params.id,
                                    _permission: permission
                                })
                            );
                        };
                    });
                    permissions.forEach(permission => {
                        if (req.body.permissions.filter(e => e === permission._permission).length === 0) {
                            actions.push(
                                m.permissions.destroy({where: {permission_id: permission.permission_id}})
                            );
                        };
                    });
                    if (actions.length > 0) {
                        Promise.allSettled(actions)
                        .then(result => res.send({result: true, message: 'Permissions saved'}))
                        .catch(err => res.error.send(err, res));
                    } else res.send({result: true, message: 'No changes'});
                })
                .catch(err => res.error.send(err, res));
            } else res.error.send('You can not edit the Admin user permissions', res);
        } else res.error.send('You can not edit your own permissions', res);
    });
};