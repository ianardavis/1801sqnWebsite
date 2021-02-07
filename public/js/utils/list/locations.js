function listLocations(line_id, blankselect = false) {
    get(
        {
            table: 'locations',
            query: []
        },
        function (locations, options) {
            let sel_location = document.querySelector(`#sel_location_${line_id}`);
            if (sel_location) {
                sel_location.innerHTML = '';
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
            };
        }
    );
};