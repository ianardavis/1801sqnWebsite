function getPermissions () {
    clear('tbl_permissions')
    .then(tbl_permissions => {
        get({
            table: 'permissions',
            where: {user_id: path[2]},
            func: getPermissions
        })
        .then(function ([result, options]) {
            setCount('permission', result.count);
            result.permissions.forEach(e => {
                let row = tbl_permissions.insertRow(-1);
                addCell(row, {text: e.permission.replaceAll('_', ' ')});
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getPermissions);
    addSortListeners('permissions', getPermissions);
    getPermissions();
});