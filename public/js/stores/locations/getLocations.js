function getLocations() {
    clear('locations_list')
    .then(locations_list => {
        get({
            table: 'locations',
            order: {col: 'location', dir: 'ASC'}
        })
        .then(function ([locations, options]) {
            locations.forEach(e => locations_list.appendChild(new Option({value: e.location}).e));
        });
    });
};