function viewLocationEdit() {
    get({
        table: 'location',
        where: {location_id: path[2]}
    })
    .then(function ([location, options]) {
        setValue('location_location_edit', location.location);
    });
};
window.addEventListener('load', function () {
    enableButton('location_edit');
    addFormListener(
        'location_edit',
        'PUT',
        `/locations/${path[2]}`,
        {
            onComplete: [
                getLocation,
                function () {modalHide('location_edit')}
            ]
        }
    );
    modalOnShow('location_edit', viewLocationEdit);
})