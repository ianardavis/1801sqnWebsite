function getLocation() {
    function display_details([location, options]) {
        setBreadcrumb(location.location);
        setInnerText('location_location',  location.location);
        setInnerText('location_createdAt', printDate(location.createdAt, true));
        setInnerText('location_updatedAt', printDate(location.updatedAt, true));
    };
    get({
        table: 'location',
        where: {location_id: path[2]}
    })
    .then(display_details);
};