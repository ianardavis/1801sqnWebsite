showPermissions = (permissions, options) => {
    clearElement('permissions');
    let _select  = document.querySelector('#permissions'),
        permission_count = document.querySelector('#permission_count');
    if (permissions) permission_count.innerText = permissions.length || '0';
    permissions.forEach(permission => {
        let _option = document.createElement('option');
        _option.innerText = permission._permission;
        _select.appendChild(_option);
    });
    hide_spinner('permissions');
};