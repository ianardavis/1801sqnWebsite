function getSerial() {
    get({
        table: 'serial',
        query: [`"serial_id":"${path[2]}"`]
    })
    .then(function ([serial, options]) {
        set_breadcrumb(serial.serial)
        set_innerText('serial_item',     serial.size.item.description);
        set_innerText('serial_size',     print_size(serial.size));
        set_innerText('serial_location', (serial.location ? serial.location.location: (serial.issue ? 'Issued' : 'Unknown')));
        set_innerText('serial_serial',   serial.serial);
        set_href('serial_item_link',     `/items/${serial.size.item_id}`);
        set_href('serial_size_link',     `/sizes/${serial.size_id}`);
        set_href('serial_location_link', (serial.location ? `/locations/${serial.location_id}` : null));
    });
};