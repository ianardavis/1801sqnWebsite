function reset_add_serial() {
    setValue('serial_serial');
    setValue('serial_location');
};
const enable_add_serial = enableButton('serial_add');
window.addEventListener( "load", function () {
    addFormListener(
        'serial_add',
        'POST',
        '/serials',
        {
            onComplete: [
                getSerials,
                function () {setValue('serial_serial')}
            ]
        }
    );
    modalOnShow('serial_add', getLocations);
    modalOnShow('serial_add', reset_add_serial);
    addListener('reload_locations_serial', getLocations);
});