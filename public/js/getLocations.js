getLocations = (locations, options) => {
    clearElement('_location_list');
    let _location_list = document.querySelector('#_location_list');
    locations.forEach(location => {
        let _option = document.createElement('option');
        _option.value = location._location;
        _location_list.appendChild(_option);
    });
    hide_spinner('locations');
};