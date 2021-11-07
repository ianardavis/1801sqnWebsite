function getSerial() {
    get({
        table: 'serial',
        query: [`"serial_id":"${path[2]}"`]
    })
    .then(function ([serial, options]) {
        set_breadcrumb({text: serial.serial})
        set_innerText({id: 'serial_item',     text: serial.size.item.description});
        set_innerText({id: 'serial_size',     text: print_size(serial.size)});
        set_innerText({id: 'serial_location', text: (serial.location ? serial.location.location: (serial.issue ? 'Issued' : 'Unknown'))});
        set_innerText({id: 'serial_serial',   text: serial.serial});
        set_href({id: 'serial_item_link',     value: `/items/${serial.size.item_id}`});
        set_href({id: 'serial_size_link',     value: `/sizes/${serial.size_id}`});
        set_href({id: 'serial_location_link', value: (serial.location ? `/locations/${serial.location_id}` : '')});
    });
};