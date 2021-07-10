function getPermissions () {
    clear('tbl_permissions')
    .then(tbl_permissions => {
        get({
            table: 'permissions',
            query: [`user_id=${path[2]}`]
        })
        .then(function ([permissions, options]) {
            set_count({id: 'permission', count: permissions.permissions.length || '0'});
            permissions.permissions.forEach(e => {
                let row = tbl_permissions.insertRow(-1);
                add_cell(row, {text: e.permission.replaceAll('_', ' ')});
            });
        });
    });
};
addReloadListener(getPermissions);