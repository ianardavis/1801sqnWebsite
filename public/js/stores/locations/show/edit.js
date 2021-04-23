function viewLocationEdit() {
    get({
        table: 'location',
        query: [`location_id=${path[2]}`]
    })
    .then(function ([location, options]) {
        set_value({id: 'location_location_edit', value: location.location});
    });
};
window.addEventListener('load', function () {
    enable_button('location_edit');
    addFormListener(
        'location_edit',
        'PUT',
        `/locations/${path[2]}`,
        {
            onComplete: [
                getLocation,
                function () {$('#mdl_location_edit').modal('hide')}
            ]
        }
    );
    $('#mdl_location_edit').on('show.bs.modal', viewLocationEdit);
})