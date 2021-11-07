function getPermissions () {
    clear('tbl_permissions')
    .then(tbl_permissions => {
        let sort_cols = tbl_permissions.parentNode.querySelector('.sort') || null;
        get({
            table: 'permissions',
            query: [`"user_id":"${path[2]}"`],
            ...sort_query(sort_cols)
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