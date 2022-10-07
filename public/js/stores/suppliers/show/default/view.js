function getDefault() {
    get({
        table: 'setting',
        where: {name: 'default_supplier'}
    })
    .then(function ([setting, options]) {
        set_innerText('supplier_is_default', yesno((setting.value === path[2])));
    });
};
window.addEventListener('load', function () {
    getDefault();
});