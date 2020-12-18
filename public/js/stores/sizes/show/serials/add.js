window.addEventListener( "load", () => {
    addFormListener(
        'form_add_serial',
        'POST',
        '/stores/serials',
        {onComplete: getSerials}
    );
});
$('#mdl_serial_add').on('show.bs.modal', function() {getLocations()});