function getPermissions (perms = {}) {
    get(
        function (permissions, options) {
            clearElement('ul_tree');
            let ul_tree = document.querySelector('#ul_tree');
            if (ul_tree) {
                permissions.tree.forEach(e => {
                    ul_tree.appendChild(new List_Item({text: e._permission, caret: (e.children && e.children.length > 0)}).e)
                    if (e.children && e.children.length > 0) {
                        e.children.forEach(f => {
                            add_permission(document.querySelector(`#ul_${e._permission}`), f)
                        })
                    };
                });
            };
            configure_tree();
            clearElement('tbl_permissions');
            let tbl_permissions  = document.querySelector('#tbl_permissions'),
                permission_count = document.querySelector('#permission_count');
            permission_count.innerText = permissions.permissions.length || '0';
            if (tbl_permissions) {
                permissions.permissions.forEach(e => {
                    let row = tbl_permissions.insertRow(-1),
                        checkbox = document.querySelector(`#permission_${e._permission}`);
                    if (checkbox) checkbox.setAttribute('checked', true)
                    add_cell(row, {
                        text: print_date(e.createdAt),
                        sort: new Date(e.createdAt).getTime()
                    });
                    add_cell(row, {text: e._permission.replace('_', ' ')});
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
function add_permission(parent, e) {
    if (parent) {
        parent.appendChild(new List_Item({text: e._permission, caret: (e.children && e.children.length > 0)}).e)
        if (e.children && e.children.length > 0) {
            e.children.forEach(f => {
                add_permission(document.querySelector(`#ul_${e._permission}`), f)
            })
        };
    };
};