function getDefault() {
    get({
        table: 'setting',
        where: {name: 'default_supplier'}
    })
    .then(function ([setting, options]) {
        setInnerText(`default_${setting.value}`, 'Default');
    });
};