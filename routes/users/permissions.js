module.exports = (app, m, inc, fn) => {
    let permission_tree = [
        {_permission: 'core_functions', children: [
            {_permission: 'access_actions',   children: []},
            {_permission: 'access_locations', children: [
                {_permission: 'location_add'},
                {_permission: 'location_edit'},
                {_permission: 'location_delete'}
            ]},
            {_permission: 'access_notes',     children: [
                {_permission: 'note_add'},
                {_permission: 'note_edit'},
                {_permission: 'note_delete'}
            ]},
            {_permission: 'access_settings',  children: [
                {_permission: 'setting_add'},
                {_permission: 'setting_edit'},
                {_permission: 'setting_delete'}
            ]}
        ]},
        {_permission: 'access_users',   children: [
            {_permission: 'user_add'},
            {_permission: 'user_edit'},
            {_permission: 'user_delete'},
            {_permission: 'access_permissions', children: [
                {_permission: 'permission_edit'}
            ]}
        ]},
        {_permission: 'access_stores',  children: [
            {_permission: 'access_issues',    children: [
                {_permission: 'issue_add'},
                {_permission: 'issue_edit'},
                {_permission: 'issue_delete'},
                {_permission: 'access_loancards', children: [
                    {_permission: 'loancard_add'},
                    {_permission: 'loancard_edit'},
                    {_permission: 'loancard_delete'},
                    {_permission: 'access_loancard_lines', children: [
                        {_permission: 'loancard_line_add'},
                        {_permission: 'loancard_line_edit'},
                        {_permission: 'loancard_line_delete'}
                    ]}
                ]}
            ]},
            {_permission: 'access_items',     children: [
                {_permission: 'item_add'},
                {_permission: 'item_edit'},
                {_permission: 'item_delete'},
                {_permission: 'access_sizes',      children: [
                    {_permission: 'size_add'},
                    {_permission: 'size_edit'},
                    {_permission: 'size_delete'},
                    {_permission: 'access_stock',       children: [
                        {_permission: 'stock_add'},
                        {_permission: 'stock_edit'},
                        {_permission: 'stock_delete'},
                        {_permission: 'access_adjustments',    children: [
                            {_permission: 'adjustment_add'},
                            {_permission: 'adjustment_edit'},
                            {_permission: 'adjustment_delete'}
                        ]}
                    ]},
                    {_permission: 'access_serials',     children: [
                        {_permission: 'serial_add'},
                        {_permission: 'serial_edit'},
                        {_permission: 'serial_delete'}
                    ]},
                    {_permission: 'access_nsns',        children: [
                        {_permission: 'nsn_add'},
                        {_permission: 'nsn_edit'},
                        {_permission: 'nsn_delete'},
                        {_permission: 'access_nsn_classes', children: [
                            {_permission: 'nsn_class_add'},
                            {_permission: 'nsn_class_edit'},
                            {_permission: 'nsn_class_delete'}
                        ]},
                        {_permission: 'access_nsn_countries', children: [
                            {_permission: 'nsn_country_add'},
                            {_permission: 'nsn_country_edit'},
                            {_permission: 'nsn_country_delete'}
                        ]},
                        {_permission: 'access_nsn_groups', children: [
                            {_permission: 'nsn_group_add'},
                            {_permission: 'nsn_group_edit'},
                            {_permission: 'nsn_group_delete'}
                        ]}
                    ]},
                    {_permission: 'access_embodiments', children: [
                        {_permission: 'embodiment_add'},
                        {_permission: 'embodiment_edit'},
                        {_permission: 'embodiment_delete'}
                    ]},
                ]},
                {_permission: 'access_categories', children: [
                    {_permission: 'category_add'},
                    {_permission: 'category_edit'},
                    {_permission: 'category_delete'}
                ]},
                {_permission: 'access_genders',    children: [
                    {_permission: 'gender_add'},
                    {_permission: 'gender_edit'},
                    {_permission: 'gender_delete'}
                ]}
            ]},
            {_permission: 'access_orders',    children: [
                {_permission: 'order_add'},
                {_permission: 'order_edit'},
                {_permission: 'order_delete'}
            ]},
            {_permission: 'access_suppliers', children: [
                {_permission: 'supplier_add'},
                {_permission: 'supplier_edit'},
                {_permission: 'supplier_delete'},
                {_permission: 'access_files',    children: [
                    {_permission: 'file_add'},
                    {_permission: 'file_edit'},
                    {_permission: 'file_delete'},
                    {_permission: 'access_file_details', children: [
                        {_permission: 'file_detail_add'},
                        {_permission: 'file_detail_edit'},
                        {_permission: 'file_detail_delete'}
                    ]}
                ]},
                {_permission: 'access_accounts', children: [
                    {_permission: 'account_add'},
                    {_permission: 'account_edit'},
                    {_permission: 'account_delete'}
                ]},
                {_permission: 'access_demands',  children: [
                    {_permission: 'demand_add'},
                    {_permission: 'demand_edit'},
                    {_permission: 'demand_delete'},
                    {_permission: 'access_demand_lines', children: [
                        {_permission: 'demand_line_add'},
                        {_permission: 'demand_line_edit'},
                        {_permission: 'demand_line_delete'}
                    ]}
                ]},
            ]}
        ]},
        {_permission: 'access_canteen', children: [
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
            {_permission: 'access_canteen_items', children: [
                {_permission: 'canteen_item_add'},
                {_permission: 'canteen_item_edit'},
                {_permission: 'canteen_item_delete'}
            ]},
            {_permission: 'access_movements',     children: [
                {_permission: 'movement_add'},
                {_permission: 'movement_edit'},
                {_permission: 'movement_delete'},
                {_permission: 'pay_out'},
                {_permission: 'pay_in'}
            ]},
            {_permission: 'access_payments'},
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
            {_permission: 'access_writeoffs',     children: [
                {_permission: 'writeoff_add'},
                {_permission: 'writeoff_edit'},
                {_permission: 'writeoff_delete'},
                {_permission: 'access_writeoff_lines', children: [
                    {_permission: 'writeoff_line_add'},
                    {_permission: 'writeoff_line_delete'}
                ]}
            ]}
        ]}
    ];
    app.get('/get/permissions', fn.li(), fn.permissions.check('access_permissions'), (req, res) => {
        m.permissions.findAll({where: req.query})
        .then(permissions => res.send({success: true, result: {permissions: permissions, tree: permission_tree}}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/permissions/:id', fn.li(), fn.permissions.check('permission_edit'),    (req, res) => {
        m.users.findOne({
            where:      {user_id: req.params.id},
            attributes: ['user_id']
        })
        .then(user => {
            if      (!user)                             fn.send_error(res, 'User not found')
            else if (user.user_id === req.user.user_id) fn.send_error(res, 'You can not edit your own permissions')
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
    });
};