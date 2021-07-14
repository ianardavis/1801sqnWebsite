function getPermissionsEdit () {
    clear('ul_tree')
    .then(ul_tree => {
        get({
            table: 'permissions',
            query: [`user_id=${path[2]}`],
            spinner: 'permission_edit'
        })
        .then(function ([permissions, options]) {
            permissions.tree.forEach(e => {
                ul_tree.appendChild(
                    new List_Item({
                        text:  e.permission,
                        caret: (e.children && e.children.length > 0)
                    }).e
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
            new List_Item({
                text:  e.permission,
                caret: (e.children && e.children.length > 0)
            }).e
        );
        if (e.children && e.children.length > 0) {
            e.children.forEach(f => {
                add_permission(document.querySelector(`#ul_${e.permission}`), f)
            })
        };
    };
};
function select_all() {
    document.querySelectorAll('#ul_tree input[type="checkbox"]').forEach(e => e.setAttribute('checked', true));
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
    addListener('btn_select_all', select_all);
});