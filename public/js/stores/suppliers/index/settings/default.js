function getDefault() {
    get({
        table: 'setting',
        where: {name: 'default_supplier'}
    })
    .then(function ([setting, options]) {
        set_innerText(`default_${setting.value}`, 'Default');
    });
};