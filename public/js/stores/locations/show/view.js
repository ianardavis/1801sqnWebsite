function getLocation() {
    get({
        table: 'location',
        query: [`location_id=${path[2]}`]
    })
    .then(function ([location, options]) {
        set_breadcrumb({text: location.location})
        set_innerText({id: 'location_location', text: location.location});
        set_innerText({id: 'location_createdAt', text: print_date(location.createdAt, true)});
        set_innerText({id: 'location_updatedAt', text: print_date(location.updatedAt, true)});
    });
};