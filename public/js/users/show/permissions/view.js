function getPermissions () {
    get(
        {
            db: path[1],
            table: 'permissions',
            query: [`user_id=${path[3]}`]
        },
        function (permissions, options) {
            set_count({id: 'permission', count: permissions.permissions.length || '0'})
            let tbl_permissions  = document.querySelector('#tbl_permissions');
            if (tbl_permissions) {
                tbl_permissions.innerHTML = '';
                permissions.permissions.forEach(e => {
                    let row = tbl_permissions.insertRow(-1);
                    add_cell(row, table_date(e.createdAt));
                    add_cell(row, {text: e._permission.replaceAll('_', ' ')});
                });
            };
        }
    );
};
document.querySelector('#reload').addEventListener('click', getPermissions);