function getPermissions (perms = {}) {
    get(
        function (permissions, options) {
            clearElement('tbl_permissions');
            let tbl_permissions  = document.querySelector('#tbl_permissions'),
                permission_count = document.querySelector('#permission_count');
            permission_count.innerText = permissions.length || '0';
            if (tbl_permissions) {
                permissions.forEach(e => {
                    let row = tbl_permissions.insertRow(-1);
                    add_cell(row, {
                        text: print_date(e.createdAt),
                        sort: new Date(e.createdAt).getTime()
                    });
                    add_cell(row, {text: e._permission.replace('_', ' ')});
                    if (options.permissions.delete === true) {
                        add_cell(row, {append: new Delete_Button({
                            small: true,
                            descriptor: 'permission', 
                            path: `/canteen/permissions/${e.permission_id}`,
                            options: {args: [perms], onComplete: getPermissions}
                        }).e})
                    };
                });
            };
        },
        {
            db: 'canteen',
            table: 'permissions',
            query: [`user_id=${path[3]}`],
            ...perms
        }
    );
    document.querySelector('#reload').addEventListener('click', getPermissions);
};