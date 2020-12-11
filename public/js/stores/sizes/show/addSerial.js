function getLocations() {
    get(
        function (locations, options) {
            let _locations_list = document.querySelector('#_locations_list');
            if (_locations_list) {
                _locations_list.innerHTML = '';
                locations.forEach(e => {
                    _locations_list.appendChild(new Option({value: e._location}).e);
                });
            }
        },
        {
            table: 'locations',
            query: []
        }
    );
};
window.addEventListener( "load", () => {
    addFormListener(
        'form_add_Serial',
        'POST',
        '/stores/serials',
        {onComplete: getSerials}
    );
});