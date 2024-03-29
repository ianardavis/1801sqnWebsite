function listLocations(options = {}) {
    clear(options.select)
    .then(sel_location => {
        get({
            table: 'locations',
            ...options
        })
        .then(function ([result, options]) {
            if (options.blank) {
                sel_location.appendChild(
                    new Option({
                        text: options.blank_text || '',
                        value: ''
                    }).e
                );
            };
            result.locations.forEach(location => {
                sel_location.appendChild(
                    new Option({
                        text: location.location,
                        value: location.location_id
                    }).e
                );
            });
        });
    })
};