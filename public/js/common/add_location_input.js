function add_location_input(divDetails, index) {
    console.log(index);
    divDetails.appendChild(new Text_Input({
        classes: ['mb-1'],
        attributes: [
            {field: 'name',        value: `lines[][${index}][location]`},
            {field: 'required',    value: true},
            {field: 'placeholder', value: 'Location'},
            {field: 'list',        value: `locations_${index}`}
        ],
        options: [{text: 'Enter Location'}]
    }).e);
};
function add_location_list(divDetails, has_serial, size_id, index) {
    const search_table = (has_serial ? 'serials' : 'stocks')
    get({
        table: search_table,
        where: {size_id: size_id}
    })
    .then(function ([result, options]) {
        let locations_list = document.createElement('datalist');
        let locs = [];
        locations_list.setAttribute('id', `locations_${index}`);
        result[search_table].forEach(e => {
            if (!locs.includes(e.location.location)) {
                locs.push(e.location.location);
                locations_list.appendChild(new Option({value: e.location.location}).e)
            };
            divDetails.appendChild(locations_list);
        });
    });
};