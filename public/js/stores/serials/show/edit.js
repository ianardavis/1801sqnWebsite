function viewSerialEdit() {
    get({
        table: 'serial',
        query: [`serial_id=${path[2]}`]
    })
    .then(function ([serial, options]) {
        set_value({id: 'serial_serial_edit', value: serial.item_number});
    })
};
window.addEventListener( "load", function () {
    enable_button('serial_edit');
    addFormListener(
        'serial_edit',
        'PUT',
        `/serials/${path[2]}`,
        {
            onComplete: [
                getSerial,
                function () {$('#mdl_serial_edit').modal('hide')}
            ]
        }
    );
    $('#mdl_serial_edit').on('show.bs.modal', viewSerialEdit);
});