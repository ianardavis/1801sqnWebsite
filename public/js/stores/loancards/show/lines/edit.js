function return_options() {
    function add_scrap_switch(divDetails, index, div_location) {
        let div_switch = new Div({classes: ['form-check', 'form-switch']}).e;
        div_switch.appendChild(new Input({
            classes: ['form-check-input'],
            attributes: [
                {field: 'type',  value: 'checkbox'},
                {field: 'role',  value: 'switch'},
                {field: 'id',    value: `scrap_${index}`},
                {field: 'name',  value: `lines[][${index}][scrap]`},
                {field: 'value', value: '1'}
            ],
            listener: {event: 'input', func: function (e) {
                if (e.target.checked) {
                    div_location.innerHTML = '';
    
                } else {
                    add_location_input(div_location, index);
    
                };
            }}
        }).e);
        div_switch.appendChild(new Label(
            'Scrap',
            {
                classes:    ['form-check-label'],
                attributes: [{field: 'for', value: `scrap_${index}`}]
            }
        ).e);
        divDetails.appendChild(div_switch);
        add_location_input(div_location, index);
    };
    
    clear(`details_${this.dataset.id}`)
    .then(divDetails => {
        if (this.value === '3') {
            get({
                table: 'loancard_line',
                where: {line_id: this.dataset.id},
                index: this.dataset.index
            })
            .then(function ([line, options]) {
                if (line.status === 2) {
                    let div_location = new Div({
                        attributes: [{field: 'id', value: `location_${line.line_id}`}]
                    }).e;
                    add_scrap_switch(divDetails, options.index, div_location);
                    divDetails.appendChild(div_location);
                    add_location_list(divDetails, (line.serial_id), line.size_id, options.index);
                    if (!line.serial_id) {
                        let qty = 0;
                        line.issues.forEach(issue => {
                            if (Number(issue.status) === 4) qty += issue.qty;
                        });
                        add_qty_input(divDetails, options.index, qty);
                    };
                };
            });
        };
    });
};

function cancel_options() {
    clear(`details_${this.dataset.id}`)
    .then(divDetails => {
        if (this.value === '0') {
            get({
                table: 'loancard_line',
                where: {line_id: this.dataset.id},
                index: this.dataset.index
            })
            .then(function ([line, options]) {
                if (line.status === 1) {
                    divDetails.appendChild(new Text_Input({
                        attributes: [
                            {field: 'name',        value: `lines[][${options.index}][location]`},
                            {field: 'required',    value: true},
                            {field: 'placeholder', value: 'Location'},
                            {field: 'list',        value: `locations_${options.index}`}
                        ],
                        options: [{text: 'Enter Location'}]
                    }).e);
                    add_location_list(divDetails, (line.serial_id), line.size_id, options.index);

                    if (!line.serial_id) {
                        divDetails.appendChild(new Number_Input({
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
const enable_action_button = function () {enableButton('action')};
window.addEventListener( "load", function () {
    addFormListener(
        'actions',
        'PUT',
        '/loancard_lines',
        {onComplete: [
            get_lines,
            get_loancard
        ]}
    );
});