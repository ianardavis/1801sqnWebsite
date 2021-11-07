function getLocations() {
    clear('locations_list')
    .then(locations_list => {
        // let sort_cols = tbl_items.parentNode.querySelector('.sort') || null;
        get({
            table: 'locations',
            sort: {col: 'location', dir: 'ASC'}
            // ...sort_query(sort_cols)
        })
        .then(function ([locations, options]) {
            locations.forEach(e => locations_list.appendChild(new Option({value: e.location}).e));
        });
    });
};