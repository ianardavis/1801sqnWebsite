function getSerials() {
    clear('tbl_serials')
    .then(tbl_serials => {
        let sort_cols = tbl_serials.parentNode.querySelector('.sort') || null;
        get({
            table: 'serials',
            query: [`"location_id":"${path[2]}"`],
            ...sort_query(sort_cols)
        })
        .then(function ([serials, options]) {
            set_count({id: 'serial', count: serials.length || '0'});
            serials.forEach(serial => {
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
        query: [`"serial_id":"${serial_id}"`]
    })
    .then(function ([serial, options]) {
        set_innerText({id: 'serial_id',        text: serial.serial_id});
        set_innerText({id: 'serial_item',      text: serial.size.item.description});
        set_innerText({id: 'serial_size',      text: print_size(serial.size)});
        set_innerText({id: 'serial_serial',    text: serial.serial});
        set_innerText({id: 'serial_createdAt', text: print_date(serial.createdAt, true)});
        set_innerText({id: 'serial_updatedAt', text: print_date(serial.updatedAt, true)});
        set_href({id: 'serial_item_link', value: `/items/${serial.size.item_id}`});
        set_href({id: 'serial_size_link', value: `/sizes/${serial.size_id}`});
        set_href({id: 'btn_serial_link',  value: `/serials/${serial.serial_id}`});
    })
};
window.addEventListener('load', function () {
    modalOnShow('serial_view', function (event) {viewSerial(event.relatedTarget.dataset.id)});
});