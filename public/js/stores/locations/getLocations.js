function getLocations() {
    get({table: 'locations'})
    .then(function ([locations, options]) {
        clear('locations_list')
        .then(locations_list => {
            locations.forEach(e => locations_list.appendChild(new Option({value: e.location}).e));
        });
    });
};