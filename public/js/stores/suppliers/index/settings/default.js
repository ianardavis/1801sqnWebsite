function getDefault() {
    get({
        table: 'setting',
        query: ['name=default_supplier']
    })
    .then(function ([setting, options]) {
        set_innerText({id: `default_${setting.value}`, text: 'Default'});
    });
};