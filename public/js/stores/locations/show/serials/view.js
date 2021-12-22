function getSerials() {
    clear('tbl_serials')
    .then(tbl_serials => {
        get({
            table: 'serials',
            where: {location_id: path[2]},
            func: getSerials
        })
        .then(function ([result, options]) {
            set_count('serial', result.count);
            result.serials.forEach(serial => {
                let row = tbl_serials.insertRow(-1);
                add_cell(row, {text: serial.size.item.description});
                add_cell(row, {text: print_size(serial.size)});
                add_cell(row, {text: serial.serial});
                add_cell(row, {append: new Button({
                    modal: 'serial_view',
                    data: [{field: 'id', value: serial.serial_id}],
                    small: true
                }).e});
            });
        });
    });
};
function viewSerial(serial_id) {
    get({
        table: 'serial',
        where: {serial_id: serial_id}
    })
    .then(function ([serial, options]) {
        set_innerText('serial_id',        serial.serial_id);
        set_innerText('serial_item',      serial.size.item.description);
        set_innerText('serial_size',      print_size(serial.size));
        set_innerText('serial_serial',    serial.serial);
        set_innerText('serial_createdAt', print_date(serial.createdAt, true));
        set_innerText('serial_updatedAt', print_date(serial.updatedAt, true));
        set_href('serial_item_link', `/items/${serial.size.item_id}`);
        set_href('serial_size_link', `/sizes/${serial.size_id}`);
        set_href('btn_serial_link',  `/serials/${serial.serial_id}`);
    })
};
window.addEventListener('load', function () {
    modalOnShow('serial_view', function (event) {viewSerial(event.relatedTarget.dataset.id)});
});