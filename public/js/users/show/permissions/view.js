function getPermissions () {
    clear('tbl_permissions')
    .then(tbl_permissions => {
        get({
            table: 'permissions',
            where: {user_id: path[2]},
            func: getPermissions
        })
        .then(function ([result, options]) {
            set_count('permission', result.count);
            result.permissions.forEach(e => {
                let row = tbl_permissions.insertRow(-1);
                add_cell(row, {text: e.permission.replaceAll('_', ' ')});
            });
        });
    });
};
addReloadListener(getPermissions);
sort_listeners(
    'permissions',
    getPermissions,
    [
        {value: 'permission', text: 'Permission', selected: true}
    ]
);