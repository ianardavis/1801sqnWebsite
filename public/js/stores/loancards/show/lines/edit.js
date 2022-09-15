function return_options() {
    edit_option('3', 2);
};
function cancel_options() {
    edit_option('0', 1);
};
function edit_option(button_value, line_status) {
    clear(`details_${this.dataset.id}`)
    .then(div_details => {
        if (this.value === button_value) {
            get({
                table: 'loancard_line',
                where: {loancard_line_id: this.dataset.id},
                index: this.dataset.index
            })
            .then(function ([line, options]) {
                if (line.status === line_status) {
                    div_details.appendChild(new Text_Input({
                        attributes: [
                            {field: 'name',        value: `lines[][${options.index}][location]`},
                            {field: 'required',    value: true},
                            {field: 'placeholder', value: 'Location'},
                            {field: 'list',        value: `locations_${options.index}`}
                        ],
                        options: [{text: 'Enter Location'}]
                    }).e);
                    get_locations(div_details, (line.serial_id), line.size_id, options.index);

                    if (!line.serial_id) {
                        div_details.appendChild(new Number_Input({
                            attributes: [
                                {field: 'min',         value: '1'},
                                {field: 'max',         value: line.qty},
                                {field: 'value',       value: line.qty},
                                {field: 'placeholder', value: 'Quantity'},
                                {field: 'name',        value: `lines[][${options.index}][qty]`},
                                {field: 'required',    value: true}
                            ]
                        }).e);
                    };
                };
            });
        };
    });
};
function get_locations(div_details, has_serial, size_id, index) {
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
            div_details.appendChild(locations_list);
        });
    });
};
window.addEventListener( "load", function () {
    addFormListener(
        'actions',
        'PUT',
        '/loancard_lines',
        {onComplete: [
            getLines,
            function () {if (typeof getLoancard === 'function') getLoancard()}
        ]}
    );
});