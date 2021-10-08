module.exports = (app, m, fn) => {
    let permission_tree = [
        {permission: 'core_functions', children: [
            {permission: 'access_actions',   children: []},
            {permission: 'access_locations', children: [
                {permission: 'location_add'},
                {permission: 'location_edit'},
                {permission: 'location_delete'}//
            ]},
            {permission: 'access_notes',     children: [
                {permission: 'note_add'},
                {permission: 'note_edit'},
                {permission: 'note_delete'}
            ]},
            {permission: 'access_settings',  children: [
                {permission: 'setting_add'},
                {permission: 'setting_edit'},
                {permission: 'setting_delete'}
            ]}
        ]},
        {permission: 'access_users',   children: [
            {permission: 'user_add'},
            {permission: 'user_edit'},
            {permission: 'user_delete'},
            {permission: 'access_permissions', children: [
                {permission: 'permission_edit', children: [
                    {permission: 'permission_edit_own'}
                ]}
            ]}
        ]},
        {permission: 'access_stores',  children: [
            {permission: 'access_issues',    children: [
                {permission: 'issue_add'},
                {permission: 'issue_edit'},
                {permission: 'issue_delete'},
                {permission: 'access_loancards', children: [
                    {permission: 'loancard_add'},
                    {permission: 'loancard_edit'},
                    {permission: 'loancard_delete'},
                    {permission: 'access_loancard_lines', children: [
                        {permission: 'loancard_line_add'},
                        {permission: 'loancard_line_edit'},
                        {permission: 'loancard_line_delete'}
                    ]}
                ]}
            ]},
            {permission: 'access_categories', children: [
                {permission: 'category_add'},
                {permission: 'category_edit'},
                {permission: 'category_delete'}
            ]},
            {permission: 'access_items',     children: [
                {permission: 'item_add'},
                {permission: 'item_edit'},
                {permission: 'item_delete'},
                {permission: 'access_sizes',      children: [
                    {permission: 'size_add'},
                    {permission: 'size_edit'},
                    {permission: 'size_delete'},
                    {permission: 'access_stocks',       children: [
                        {permission: 'stock_add'},
                        {permission: 'stock_edit'},
                        {permission: 'stock_delete'},
                        {permission: 'access_adjustments',    children: [
                            {permission: 'adjustment_add'},
                            {permission: 'adjustment_edit'},//
                            {permission: 'adjustment_delete'}//
                        ]}
                    ]},
                    {permission: 'access_serials',     children: [
                        {permission: 'serial_add'},
                        {permission: 'serial_edit'},
                        {permission: 'serial_delete'}
                    ]},
                    {permission: 'access_details',     children: [
                        {permission: 'detail_add'},
                        {permission: 'detail_edit'},
                        {permission: 'detail_delete'}
                    ]},
                    {permission: 'access_nsns',        children: [
                        {permission: 'nsn_add'},
                        {permission: 'nsn_edit'},
                        {permission: 'nsn_delete'},
                        {permission: 'access_nsn_classes', children: [//
                            {permission: 'nsn_class_add'},//
                            {permission: 'nsn_class_edit'},//
                            {permission: 'nsn_class_delete'}//
                        ]},
                        {permission: 'access_nsn_countries', children: [//
                            {permission: 'nsn_country_add'},//
                            {permission: 'nsn_country_edit'},//
                            {permission: 'nsn_country_delete'}//
                        ]},
                        {permission: 'access_nsn_groups', children: [//
                            {permission: 'nsn_group_add'},//
                            {permission: 'nsn_group_edit'},//
                            {permission: 'nsn_group_delete'}//
                        ]}
                    ]},
                    {permission: 'access_embodiments', children: [//
                        {permission: 'embodiment_add'},//
                        {permission: 'embodiment_edit'},//
                        {permission: 'embodiment_delete'}//
                    ]},
                ]},
                {permission: 'access_item_categories', children: [
                    {permission: 'item_category_add'},
                    {permission: 'item_category_edit'},
                    {permission: 'item_category_delete'}
                ]},
                {permission: 'access_genders',    children: [
                    {permission: 'gender_add'},
                    {permission: 'gender_edit'},
                    {permission: 'gender_delete'}
                ]}
            ]},
            {permission: 'access_orders',    children: [
                {permission: 'order_add'},
                {permission: 'order_edit'},
                {permission: 'order_delete'}
            ]},
            {permission: 'access_suppliers', children: [
                {permission: 'supplier_add'},
                {permission: 'supplier_edit'},
                {permission: 'supplier_delete'},
                {permission: 'access_supplier_contacts', children: [
                    {permission: 'supplier_contact_add'},
                    {permission: 'supplier_contact_edit'},
                    {permission: 'supplier_contact_delete'}
                ]},
                {permission: 'access_supplier_addresses', children: [
                    {permission: 'supplier_address_add'},
                    {permission: 'supplier_address_edit'},
                    {permission: 'supplier_address_delete'}
                ]},
                {permission: 'access_files',    children: [
                    {permission: 'file_add'},
                    {permission: 'file_edit'},
                    {permission: 'file_delete'},
                    {permission: 'access_file_details', children: [
                        {permission: 'file_detail_add'},
                        {permission: 'file_detail_edit'},
                        {permission: 'file_detail_delete'}
                    ]}
                ]},
                {permission: 'access_accounts', children: [
                    {permission: 'account_add'},
                    {permission: 'account_edit'},
                    {permission: 'account_delete'}
                ]},
                {permission: 'access_demands',  children: [
                    {permission: 'demand_add'},
                    {permission: 'demand_edit'},
                    {permission: 'demand_delete'},
                    {permission: 'access_demand_lines', children: [
                        {permission: 'demand_line_add'},
                        {permission: 'demand_line_edit'},
                        {permission: 'demand_line_delete'}
                    ]}
                ]},
            ]},
            {permission: 'access_reports'}
        ]},
        {permission: 'access_canteen', children: [
            {permission: 'access_pos'},
            {permission: 'access_credits',       children: [
                {permission: 'credit_add'},//
                {permission: 'credit_edit'},//
                {permission: 'credit_delete'}//
            ]},
            {permission: 'access_holdings',      children: [
                {permission: 'holding_add'},
                {permission: 'holding_edit'},
                {permission: 'holding_delete'}//
            ]},
            {permission: 'access_canteen_items', children: [
                {permission: 'canteen_item_add'},
                {permission: 'canteen_item_edit'},
                {permission: 'canteen_item_delete'}
            ]},
            {permission: 'access_paid_in_outs',  children: [
                {permission: 'paid_in_out_add'},
                {permission: 'paid_in_out_edit'},
                {permission: 'paid_in_out_delete'}
            ]},
            {permission: 'access_movements',     children: [
                {permission: 'movement_add'},
                {permission: 'movement_edit'},//
                {permission: 'movement_delete'}//
            ]},
            {permission: 'access_payments'},
            {permission: 'access_pos_layouts',   children: [//
                {permission: 'pos_layout_edit'}
            ]},
            {permission: 'access_pos_pages',     children: [//
                {permission: 'pos_page_add'},//
                {permission: 'pos_page_edit'},//
                {permission: 'pos_page_delete'}//
            ]},
            {permission: 'access_receipts',      children: [
                {permission: 'receipt_add'},
                {permission: 'receipt_edit'},//
                {permission: 'receipt_delete'},//
                {permission: 'access_receipt_lines', children: [//
                    {permission: 'receipt_line_add'},//
                    {permission: 'receipt_line_delete'}//
                ]}
            ]},
            {permission: 'access_sales',         children: [
                {permission: 'access_sale_lines'}//
            ]},
            {permission: 'access_sessions',      children: [
                {permission: 'session_add'},
                {permission: 'session_edit'},
                {permission: 'session_delete'}//
            ]},
            {permission: 'access_writeoffs',     children: [
                {permission: 'writeoff_add'},
                {permission: 'writeoff_edit'},//
                {permission: 'writeoff_delete'},//
                {permission: 'access_writeoff_lines', children: [//
                    {permission: 'writeoff_line_add'},//
                    {permission: 'writeoff_line_delete'}//
                ]}
            ]}
        ]},
        {permission: 'site_functions', children: [//
            {permission: 'access_galleries', children: [//
                {permission: 'gallery_add'},
                {permission: 'gallery_edit'},//
                {permission: 'gallery_delete'}//
            ]},
            {permission: 'access_gallery_images', children: [//
                {permission: 'gallery_image_add'},
                {permission: 'gallery_image_edit'},
                {permission: 'gallery_image_delete'}
            ]}
        ]},
    ];
    app.get('/get/permissions', fn.loggedIn(), fn.permissions.check('access_permissions'), (req, res) => {
        m.permissions.findAll({where: req.query})
        .then(permissions => res.send({success: true, result: {permissions: permissions, tree: permission_tree}}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/permissions/:id', fn.loggedIn(), fn.permissions.check('permission_edit'),    (req, res) => {
        fn.allowed(req.user.user_id, 'permission_edit_own', true)
        .then(edit_own => {
            fn.get(
                'users',
                {user_id: req.params.id}
            )
            .then(user => {
                if (user.user_id === req.user.user_id && !edit_own) fn.send_error(res, 'You can not edit your own permissions')
                else {
                    return m.permissions.findAll({
                        where: {user_id: user.user_id},
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
                                        user_id: user.user_id,
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
                };
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
};