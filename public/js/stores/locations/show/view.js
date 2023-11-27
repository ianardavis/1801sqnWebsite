function getLocation() {
    function display_details([location, options]) {
        setBreadcrumb(location.location);
        setInnerText('location_location',  location.location);
        setInnerText('location_createdAt', print_date(location.createdAt, true));
        setInnerText('location_updatedAt', print_date(location.updatedAt, true));
    };
    get({
        table: 'location',
        where: {location_id: path[2]}
    })
    .then(display_details);
};