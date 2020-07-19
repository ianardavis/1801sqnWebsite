getLocations = (locations, options) => {
    let _location_list = document.querySelector('#_location_list');
    _location_list.innerHTML = '';
    locations.forEach(location => {
        let _option = document.createElement('option');
        _option.value = location._location;
        _location_list.appendChild(_option);
    });
    hide_spinner('locations');
};