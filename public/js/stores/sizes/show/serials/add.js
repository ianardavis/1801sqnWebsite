function reset_add_serial() {
    set_value({id: 'serial_serial'});
    set_value({id: 'serial_location'});
};
window.addEventListener( "load", function () {
    enable_button('serial_add');
    addFormListener(
        'serial_add',
        'POST',
        '/serials',
        {
            onComplete: [
                getSerials,
                function () {set_value({id: 'serial_serial'})}
            ]
        }
    );
    $('#mdl_serial_add').on('show.bs.modal', getLocations);
    $('#mdl_serial_add').on('show.bs.modal', reset_add_serial);
    addListener('reload_locations_serial', getLocations);
});