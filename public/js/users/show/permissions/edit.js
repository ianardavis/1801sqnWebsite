function getPermissionsEdit () {
    clear('ul_tree')
    .then(ul_tree => {
        get({
            table: 'permissions',
            query: [`"user_id":"${path[2]}"`],
            spinner: 'permission_edit'
        })
        .then(function ([permissions, options]) {
            permissions.tree.forEach(e => {
                ul_tree.appendChild(
                    new List_Item(
                        e.permission,
                        (e.children && e.children.length > 0)
                    ).e
                );
                if (e.children && e.children.length > 0) {
                    e.children.forEach(f => {
                        add_permission(document.querySelector(`#ul_${e.permission}`), f)
                    });
                };
            });
            configure_tree();
            permissions.permissions.forEach(e => {
                let checkbox = document.querySelector(`#chk_${e.permission}`);
                if (checkbox) checkbox.setAttribute('checked', true);
            });
        });
    });
};
function add_permission(parent, e) {
    if (parent) {
        parent.appendChild(
            new List_Item(
                e.permission,
                (e.children && e.children.length > 0)
            ).e
        );
        if (e.children && e.children.length > 0) {
            e.children.forEach(f => {
                add_permission(document.querySelector(`#ul_${e.permission}`), f)
            })
        };
    };
};
function select_all_permissions() {
    document.querySelectorAll('#ul_tree input[type="checkbox"]').forEach(e => check_permission(e));
};
function set_storeman() {
    [

    ].forEach(permission => {
        let e = document.querySelector(`#check_${permission}`);
        if (e) check_permission(e);
    });
};
function set_canteen() {
    [
        'access_canteen',
        'access_users',
        'access_pos',
        'access_credits',
        'access_canteen_items',
        'access_pos_layouts',
        'access_pos_pages',
        'access_sales',
        'access_sale_lines',
        'access_sessions',
        'session_add',
        'session_edit'
    ].forEach(permission => {
        let e = document.querySelector(`#chk_${permission}`);
        if (e) check_permission(e);
    });
};
function check_permission(permission) {
    permission.setAttribute('checked', true)
};
window.addEventListener('load', function () {
    enable_button('permissions_edit')
    addListener('reload_permission_edit', getPermissionsEdit);
    addFormListener(
        'permissions_edit',
        'PUT',
        `/permissions/${path[2]}`,
        {
            onComplete: [
                getPermissions,
                function() {modalHide('permissions_edit')}
            ]
        }
    );
    modalOnShow('permissions_edit', getPermissionsEdit);
    addListener('btn_select_all', select_all_permissions);
    addListener('btn_permissions_storeman', set_storeman);
    addListener('btn_permissions_canteen', set_canteen);
});