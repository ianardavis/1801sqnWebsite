function getLocations() {
    clear('locations_list')
    .then(locations_list => {
        let sort_cols = tbl_items.parentNode.querySelector('.sort') || null;
        get({
            table: 'locations',
            sort:  (sort_cols ? {col: sort_cols.dataset.sort_col, dir: sort_cols.dataset.sort_dir} : null)
        })
        .then(function ([locations, options]) {
            locations.forEach(e => locations_list.appendChild(new Option({value: e.location}).e));
        });
    });
};