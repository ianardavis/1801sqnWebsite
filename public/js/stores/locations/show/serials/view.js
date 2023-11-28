function getSerials() {
    clear('tbl_serials')
    .then(tbl_serials => {
        function add_line(serial) {
            let row = tbl_serials.insertRow(-1);
            addCell(row, {text: serial.size.item.description});
            addCell(row, {text: printSize(serial.size)});
            addCell(row, {text: serial.serial});
            addCell(row, {append: new Modal_Button(
                _search(),
                'serial_view',
                [{field: 'id', value: serial.serial_id}]
            ).e});
        };
        get({
            table: 'serials',
            where: {location_id: path[2]},
            func: getSerials
        })
        .then(function ([result, options]) {
            setCount('serial', result.count);
            result.serials.forEach(serial => {
                add_line(serial);
            });
        });
    });
};
function viewSerial(serial_id) {
    function display_details([serial, options]) {
        setInnerText('serial_id',        serial.serial_id);
        setInnerText('serial_item',      serial.size.item.description);
        setInnerText('serial_size',      printSize(serial.size));
        setInnerText('serial_serial',    serial.serial);
        setInnerText('serial_createdAt', printDate(serial.createdAt, true));
        setInnerText('serial_updatedAt', printDate(serial.updatedAt, true));
        return serial;
    };
    function set_links(serial) {
        setHREF('serial_item_link', `/items/${serial.size.item_id}`);
        setHREF('serial_size_link', `/sizes/${serial.size_id}`);
        setHREF('btn_serial_link',  `/serials/${serial.serial_id}`);
        return serial;
    };
    get({
        table: 'serial',
        where: {serial_id: serial_id}
    })
    .then(display_details)
    .then(set_links);
};
window.addEventListener('load', function () {
    modalOnShow('serial_view', function (event) {viewSerial(event.relatedTarget.dataset.id)});
});