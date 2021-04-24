function getDefault() {
    get({
        table: 'setting',
        query: ['name=default_supplier']
    })
    .then(function ([setting, options]) {
        set_innerText({id: 'supplier_is_default', text: yesno((setting.value === path[2]))});
    });
};