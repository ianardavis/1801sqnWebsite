function getLocations() {
    get(
        function (locations, options) {
            let locations_list = document.querySelector('#locations_list');
            if (locations_list) {
                locations_list.innerHTML = '';
                locations.forEach(e => locations_list.appendChild(new Option({value: e._location}).e));
            }
        },
        {
            table: 'locations',
            query: []
        }
    );
};