function getPrinters() {
    clear_table('printers')
    .then(tbl_printers => {
        get({table: 'printers'})
        .then(function ([printers, options]) {
            console.log(printers)
            printers.forEach(printer => {
                let row = tbl_printers.insertRow(-1);
                add_cell(row, {text: printer.deviceId});
                add_cell(row, {append: new Button({
                    attributes: [
                        {field: 'name', value: 'printer'},
                        {field: 'type',  value: 'submit'},
                        {field: 'value', value: printer.deviceId}
                    ],
                    small: true,
                    type: 'edit'
                }).e})
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('btn_printers', getPrinters);
    addFormListener(
        'printers',
        'POST',
        '/printers',
        {onComplete: getPrinter}
    )
});