function getPrinter() {
    get({
        table: 'setting',
        query: ['name=printer'],
        spinner: 'printers'
    })
    .then(function ([setting, options]) {
        set_innerText({id: 'setting_printer', value: setting.value})
    })
};
addReloadListener(getPrinter);