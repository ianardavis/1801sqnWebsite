function getLocations() {
    clear('locations_list')
    .then(locations_list => {
        get({
            table: 'locations',
            order: ['location', 'ASC']
        })
        .then(function ([results, options]) {
            results.locations.forEach(e => locations_list.appendChild(new Option({value: e.location}).e));
        });
    });
};