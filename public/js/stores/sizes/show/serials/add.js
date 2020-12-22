window.addEventListener( "load", () => {
    addFormListener(
        'form_serial_add',
        'POST',
        '/stores/serials',
        {onComplete: getSerials}
    );
});
$('#mdl_serial_add').on('show.bs.modal', function() {getLocations()});