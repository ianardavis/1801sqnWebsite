function getDefault() {
    get({
        table: 'setting',
        query: ['"name":"default_supplier"']
    })
    .then(function ([setting, options]) {
        set_innerText('supplier_is_default', yesno((setting.value === path[2])));
    });
};