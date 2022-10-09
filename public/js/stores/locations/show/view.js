function getLocation() {
    get({
        table: 'location',
        where: {location_id: path[2]}
    })
    .then(function ([location, options]) {
        set_breadcrumb(location.location)
        set_innerText('location_location',  location.location);
        set_innerText('location_createdAt', print_date(location.createdAt, true));
        set_innerText('location_updatedAt', print_date(location.updatedAt, true));
    });
};