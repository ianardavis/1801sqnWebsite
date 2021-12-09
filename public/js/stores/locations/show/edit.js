function viewLocationEdit() {
    get({
        table: 'location',
        query: [`"location_id":"${path[2]}"`]
    })
    .then(function ([location, options]) {
        set_value('location_location_edit', location.location);
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
                function () {modalHide('location_edit')}
            ]
        }
    );
    modalOnShow('location_edit', viewLocationEdit);
})