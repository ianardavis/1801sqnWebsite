window.addEventListener( "load", function () {
    remove_attribute({id: 'btn_serial_add', attribute: 'disabled'});
    addFormListener(
        'serial_add',
        'POST',
        '/stores/serials',
        {onComplete: getSerials}
    );
    $('#mdl_serial_add').on('show.bs.modal', getLocations);
});