function viewSerialEdit() {
    get({
        table: 'serial',
        query: [`"serial_id":"${path[2]}"`]
    })
    .then(function ([serial, options]) {
        set_value('serial_serial_edit', serial.item_number);
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
                function () {modalHide('serial_edit')}
            ]
        }
    );
    modalOnShow('serial_edit', viewSerialEdit);
});