function reset_add_serial() {
    set_value('serial_serial');
    set_value('serial_location');
};
const enable_add_serial = enable_button('serial_add');
window.addEventListener( "load", function () {
    addFormListener(
        'serial_add',
        'POST',
        '/serials',
        {
            onComplete: [
                getSerials,
                function () {set_value('serial_serial')}
            ]
        }
    );
    modalOnShow('serial_add', getLocations);
    modalOnShow('serial_add', reset_add_serial);
    add_listener('reload_locations_serial', getLocations);
});