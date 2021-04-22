function listLocations(line_id, blankselect = false) {
    clear_select(`location_${line_id}`)
    .then(sel_location => {
        get({table: 'locations'})
        .then(function ([locations, options]) {
            if (blankselect) sel_location.appendChild(
                new Option({
                    text: 'Select Location',
                    value: ''
                }).e
            );
            locations.forEach(location => {
                sel_location.appendChild(
                    new Option({
                        text: location._location,
                        value: location.location_id
                    }).e
                );
            });
        });
    })
};