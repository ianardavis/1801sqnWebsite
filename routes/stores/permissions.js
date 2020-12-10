module.exports = (app, allowed, inc, permissions, m) => {
    // let permission_tree = [
    //     {_permission: 'access_stores',            children: [
    //         {_permission: 'access_accounts',      children: [
    //             {_permission: 'accountt_add'},
    //             {_permission: 'account_edit'},
    //             {_permission: 'account_delete'}
    //         ]},
    //         {_permission: 'access_adjusts',       children: [
    //             {_permission: 'adjust_add'},
    //             {_permission: 'adjust_edit'},
    //             {_permission: 'adjust_delete'}
    //         ]},
    //         {_permission: 'access_categories',    children: [
    //             {_permission: 'category_add'},
    //             {_permission: 'category_edit'},
    //             {_permission: 'category_delete'},
    //             {_permission: 'access_groups',      children: [
    //                 {_permission: 'group_add'},
    //                 {_permission: 'group_edit'},
    //                 {_permission: 'group_delete'},
    //                 {_permission: 'access_types',      children: [
    //                     {_permission: 'type_add'},
    //                     {_permission: 'typep_edit'},
    //                     {_permission: 'type_delete'},
    //                     {_permission: 'access_subtypes',      children: [
    //                         {_permission: 'subtype_add'},
    //                         {_permission: 'subtype_edit'},
    //                         {_permission: 'subtype_delete'}
    //                     ]}
    //                 ]}
    //             ]}
    //         ]},
    //         {_permission: 'access_demands',       children: [
    //             {_permission: 'demand_add'},
    //             {_permission: 'demand_edit'},
    //             {_permission: 'demand_delete'},
    //             {_permission: 'access_demand_lines', children: [
    //                 {_permission: 'demand_line_add'},
    //                 {_permission: 'demand_line_edit'},
    //                 {_permission: 'demand_line_delete'}
    //             ]}
    //         ]},
    //         {_permission: 'access_files',         children: [
    //             {_permission: 'file_add'},
    //             {_permission: 'file_edit'},
    //             {_permission: 'file_delete'}
    //         ]},
    //         {_permission: 'access_genders',       children: [
    //             {_permission: 'gender_add'},
    //             {_permission: 'gender_edit'},
    //             {_permission: 'gender_delete'}
    //         ]},
    //         {_permission: 'access_issues',        children: [
    //             {_permission: 'issue_add'},
    //             {_permission: 'issue_edit'},
    //             {_permission: 'issue_delete'},
    //             {_permission: 'access_issue_lines', children: [
    //                 {_permission: 'issue_line_add'},
    //                 {_permission: 'issue_line_edit'},
    //                 {_permission: 'issue_line_delete'},
    //                 {_permission: 'access_issue_line_returns', children: [
    //                     {_permission: 'issue_line_return_add'},
    //                     {_permission: 'issue_line_return_edit'},
    //                     {_permission: 'issue_line_return_delete'}
    //                 ]}
    //             ]}
    //         ]},
    //         {_permission: 'access_items',         children: [
    //             {_permission: 'item_add'},
    //             {_permission: 'item_edit'},
    //             {_permission: 'item_delete'},
    //             {_permission: 'access_sizes',      children: [
    //                 {_permission: 'size_add'},
    //                 {_permission: 'size_edit'},
    //                 {_permission: 'size_delete'},
    //                 {_permission: 'access_stock',   children: [
    //                     {_permission: 'stock_add'},
    //                     {_permission: 'stock_edit'},
    //                     {_permission: 'stock_delete'}
    //                 ]},
    //                 {_permission: 'access_serials',   children: [
    //                     {_permission: 'serial_add'},
    //                     {_permission: 'serial_edit'},
    //                     {_permission: 'serial_delete'}
    //                 ]},
    //                 {_permission: 'access_nsns',         children: [
    //                     {_permission: 'nsn_add'},
    //                     {_permission: 'nsn_edit'},
    //                     {_permission: 'nsn_delete'},
    //                     {_permission: 'access_nsn_classifications', children: [
    //                         {_permission: 'nsn_classification_add'},
    //                         {_permission: 'nsn_classification_edit'},
    //                         {_permission: 'nsn_classification_delete'}
    //                     ]},
    //                     {_permission: 'access_nsn_countries', children: [
    //                         {_permission: 'nsn_country_add'},
    //                         {_permission: 'nsn_country_edit'},
    //                         {_permission: 'nsn_country_delete'}
    //                     ]},
    //                     {_permission: 'access_nsn_groups', children: [
    //                         {_permission: 'nsn_group_add'},
    //                         {_permission: 'nsn_group_edit'},
    //                         {_permission: 'nsn_group_delete'}
    //                     ]}
    //                 ]}
    //             ]}
    //         ]},
    //         {_permission: 'access_locations',     children: [
    //             {_permission: 'location_add'},
    //             {_permission: 'location_edit'},
    //             {_permission: 'location_delete'}
    //         ]},
    //         {_permission: 'access_notes',         children: [
    //             {_permission: 'note_add'},
    //             {_permission: 'note_edit'},
    //             {_permission: 'note_delete'}
    //         ]},
    //         {_permission: 'access_notifications', children: [
    //             {_permission: 'notification_add'},
    //             {_permission: 'notification_edit'},
    //             {_permission: 'notification_delete'}
    //         ]},
    //         {_permission: 'access_orders',        children: [
    //             {_permission: 'order_add'},
    //             {_permission: 'order_edit'},
    //             {_permission: 'order_delete'},
    //             {_permission: 'access_order_lines', children: [
    //                 {_permission: 'order_line_add'},
    //                 {_permission: 'order_line_edit'},
    //                 {_permission: 'order_line_delete'},
    //                 {_permission: 'access_order_actions', children: [
    //                     {_permission: 'order_line_action_add'},
    //                     {_permission: 'order_line_action_edit'},
    //                     {_permission: 'order_line_action_delete'}
    //                 ]}
    //             ]}
    //         ]},
    //         {_permission: 'access_receipts',      children: [
    //             {_permission: 'receipt_add'},
    //             {_permission: 'receipt_edit'},
    //             {_permission: 'receipt_delete'},
    //             {_permission: 'access_receipt_lines', children: [
    //                 {_permission: 'receipt_line_add'},
    //                 {_permission: 'receipt_line_edit'},
    //                 {_permission: 'receipt_line_delete'}
    //             ]}
    //         ]},
    //         {_permission: 'access_requests',      children: [
    //             {_permission: 'request_add'},
    //             {_permission: 'request_edit'},
    //             {_permission: 'request_delete'},
    //             {_permission: 'access_request_lines', children: [
    //                 {_permission: 'request_line_add'},
    //                 {_permission: 'request_line_edit'},
    //                 {_permission: 'request_line_delete'}
    //             ]}
    //         ]},
    //         {_permission: 'access_settings',      children: [
    //             {_permission: 'setting_add'},
    //             {_permission: 'setting_edit'},
    //             {_permission: 'setting_delete'}
    //         ]},
    //         {_permission: 'access_suppliers',     children: [
    //             {_permission: 'supplier_add'},
    //             {_permission: 'supplier_edit'},
    //             {_permission: 'supplier_delete'}
    //         ]},
    //         {_permission: 'access_users',         children: [
    //             {_permission: 'access_permissions',   children: [
    //                 {_permission: 'permission_edit'}
    //             ]}
    //         ]}
    //     ]}
    // ];
    // app.get('/canteen/get/permissions',    permissions, allowed('access_permissions', {send: true}), (req, res) => {
    //     m.permissions.findAll({
    //         where: req.query,
    //         attributes: ['permission_id', '_permission', 'createdAt']
    //     })
    //     .then(permissions => res.send({result: true, permissions: {permissions: permissions, tree: permission_tree}}))
    //     .catch(err => res.error.send(err, res));
    // });
    // app.put('/canteen/permissions/:id',    permissions, allowed('permission_edit',    {send: true}), (req, res) => {
    //     m.users.findOne({
    //         where: {user_id: req.params.id},
    //         attributes: ['user_id']
    //     })
    //     .then(user => {
    //         if      (!user)                             res.send({result: false, message: 'User not found'})
    //         else if (user.user_id === req.user.user_id) res.send({result: false, message: 'You can not edit your own permissions'})
    //         else if (user.user_id === 1)                res.send({result: false, message: 'You can not edit teh admin user permissions'})
    //         else {
    //             return m.permissions.findAll({
    //                 where: {user_id: user.user_id},
    //                 attributes: ['permission_id', '_permission']
    //             })
    //             .then(permissions => {
    //                 let actions = [];
    //                 permissions.forEach(permission => {
    //                     if (!req.body.permissions.includes(permission._permission)) {
    //                         actions.push(
    //                             m.permissions.destroy({where: {permission_id: permission.permission_id}})
    //                         );
    //                     }
    //                 });
    //                 req.body.permissions.forEach(permission => {
    //                     actions.push(
    //                         m.permissions.findOrCreate({
    //                             where: {
    //                                 user_id: user.user_id,
    //                                 _permission: permission
    //                             }
    //                         })
    //                     );
    //                 });
    //                 return Promise.allSettled(actions)
    //                 .then(results => {
    //                     console.log(results);
    //                     res.send({result: true, message: 'Permissions edited'});
    //                 })
    //                 .catch(err => res.error.send(err, res));
    //             })
    //             .catch(err => res.error.send(err, res));
    //         };
    //     })
    //     .catch(err => res.error.send(err, res));
    // });


    // app.get('/stores/permissions/:id/edit', permissions, allowed('permission_edit'),                  (req, res) => {
    //     if (Number(req.params.id) === req.user.user_id && Number(req.params.id) !== 2) {
    //         res.error.redirect(new Error('You can not edit your own permissions'), req, res);
    //     } else if (Number(req.params.id) === 1) {
    //         res.error.redirect(new Error('You can not edit the Admin user permissions'), req, res);
    //     } else {
    //         m.users.findOne({
    //             where: {user_id: req.params.id},
    //             include: [
    //                 m.ranks,
    //                 {model: m.permissions, attributes: {exclude: ['createdAt', 'updatedAt', 'user_id']}}
    //             ]
    //         })
    //         .then(user => {
    //             let attributes = [];
    //             for (let attribute in m.permissions.rawAttributes) {
    //                 if (!m.permissions.rawAttributes.hasOwnProperty(attribute)) continue;
    //                 let obj = m.permissions.rawAttributes[attribute];
    //                 if (obj.fieldName !== 'user_id' && obj.fieldName !== 'createdAt' && obj.fieldName !== 'updatedAt') {
    //                     attributes.push(JSON.stringify({name: obj.fieldName, parent: obj.comment}))
    //                 };
    //             };
    //             res.render('stores/permissions/edit', {
    //                 f_user:     user,
    //                 attributes: attributes
    //             });
    //         })
    //         .catch(err => res.error.redirect(err, req, res));
    //     };
    // });
    
    // app.get('/stores/get/permissions',      permissions, allowed('access_permissions', {send: true}), (req, res) => {
    //     m.permissions.findAll({
    //         where:      req.query,
    //         attributes: ['_permission']
    //     })
    //     .then(permissions => res.send({result: true, permissions: permissions}))
    //     .catch(err => res.error.send(err, res));
    // });

    // app.put('/stores/permissions/:id',      permissions, allowed('permission_edit',    {send: true}), (req, res) => {
    //     if (Number(req.params.id) !== req.user.user_id || Number(req.params.id) === 2) {
    //         if (Number(req.params.id) !== 1) {
    //             m.permissions.findAll({
    //                 where: {user_id: req.params.id},
    //                 attributes: ['permission_id', '_permission']
    //             })
    //             .then(permissions => {
    //                 let actions = [];
    //                 req.body.permissions.forEach(permission => {
    //                     if (permissions.filter(e => e._permission === permission).length === 0) {
    //                         actions.push(
    //                             m.permissions.create({
    //                                 user_id: req.params.id,
    //                                 _permission: permission
    //                             })
    //                         );
    //                     };
    //                 });
    //                 permissions.forEach(permission => {
    //                     if (req.body.permissions.filter(e => e === permission._permission).length === 0) {
    //                         actions.push(
    //                             m.permissions.destroy({where: {permission_id: permission.permission_id}})
    //                         );
    //                     };
    //                 });
    //                 if (actions.length > 0) {
    //                     Promise.allSettled(actions)
    //                     .then(result => res.send({result: true, message: 'Permissions saved'}))
    //                     .catch(err => res.error.send(err, res));
    //                 } else res.send({result: true, message: 'No changes'});
    //             })
    //             .catch(err => res.error.send(err, res));
    //         } else res.error.send('You can not edit the Admin user permissions', res);
    //     } else res.error.send('You can not edit your own permissions', res);
    // });
};