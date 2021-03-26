function getPermissionsEdit () {
    get(
        {
            table: 'permissions',
            query: [`user_id=${path[2]}`],
            spinner: 'permission_edit'
        },
        function (permissions, options) {
            let ul_tree = document.querySelector('#ul_tree');
            if (ul_tree) {
                ul_tree.innerHTML = '';
                permissions.tree.forEach(e => {
                    ul_tree.appendChild(
                        new List_Item({
                            text:  e._permission,
                            caret: (e.children && e.children.length > 0)
                        }).e
                    );
                    if (e.children && e.children.length > 0) {
                        e.children.forEach(f => {
                            add_permission(document.querySelector(`#ul_${e._permission}`), f)
                        });
                    };
                });
            };
            configure_tree();
            permissions.permissions.forEach(e => {
                let checkbox = document.querySelector(`#permission_${e._permission}`);
                if (checkbox) checkbox.setAttribute('checked', true);
            });
        }
    );
};
function add_permission(parent, e) {
    if (parent) {
        parent.appendChild(
            new List_Item({
                text:  e._permission,
                caret: (e.children && e.children.length > 0)
            }).e
        );
        if (e.children && e.children.length > 0) {
            e.children.forEach(f => {
                add_permission(document.querySelector(`#ul_${e._permission}`), f)
            })
        };
    };
};
window.addEventListener('load', function () {
    document.querySelector('#reload_permission_edit').addEventListener('click', getPermissionsEdit);
    addFormListener(
        'permissions_edit',
        'PUT',
        `/${path[1]}/permissions/${path[2]}`,
        {
            onComplete: [
                getPermissions,
                function() {$('#mdl_permissions_edit').modal('hide')}
            ]
        }
    );
    $('#mdl_permissions_edit').on('show.bs.modal', getPermissionsEdit);
});