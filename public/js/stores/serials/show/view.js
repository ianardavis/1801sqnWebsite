function getSerial() {
    function display_details([serial, options]) {
        setBreadcrumb(serial.serial)
        setInnerText('serial_item',     serial.size.item.description);
        setInnerText('serial_size',     print_size(serial.size));
        setInnerText('serial_location', (serial.location ? serial.location.location: (serial.issue ? 'Issued' : 'Unknown')));
        setInnerText('serial_serial',   serial.serial);
        return serial;
    };
    function set_links(serial) {
        setHREF('serial_item_link',     `/items/${serial.size.item_id}`);
        setHREF('serial_size_link',     `/sizes/${serial.size_id}`);
        setHREF('serial_location_link', (serial.location ? `/locations/${serial.location_id}` : null));
        return serial;
    };

    get({
        table: 'serial',
        where: {serial_id: path[2]}
    })
    .then(display_details)
    .then(set_links);
};