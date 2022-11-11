function return_options() {
    clear(`details_${this.dataset.id}`)
    .then(div_details => {
        if (this.value === '3') {
            get({
                table: 'loancard_line',
                where: {loancard_line_id: this.dataset.id},
                index: this.dataset.index
            })
            .then(function ([line, options]) {
                if (line.status === 2) {
                    let div_location = new Div({
                        attributes: [{field: 'id', value: `location_${line.loancard_line_id}`}]
                    }).e;
                    add_scrap_switch(div_details, options.index, div_location);
                    div_details.appendChild(div_location);
                    get_locations(div_details, (line.serial_id), line.size_id, options.index);
                    if (!line.serial_id) add_qty_inputs(div_details, line, options.index);
                };
            });
        };
    });
};
function add_scrap_switch(div_details, index, div_location) {
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
    div_details.appendChild(div_switch);
    add_location_input(div_location, index);
};
function add_location_input(div_location, index) {
    div_location.appendChild(new Text_Input({
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
function add_qty_inputs(div_details, line, index) {
    const line_id = `issues_${line.loancard_line_id}`;
    let div_issues = document.createElement('div');
    let total_qty = new Number_Input({
        attributes: [{field: 'disabled', value: true}]
    }).e;
    div_details.appendChild(total_qty);
    function update_qty() {
        let qty = 0;
        const inputs = div_issues.querySelectorAll('input.issue_input');
        inputs.forEach(e => qty += Number(e.value));
        if (Number(qty) <= 0) {
            document.querySelector(`#rad_${line.loancard_line_id}_nil`).click();
        } else {
            total_qty.value = Number(qty);
        };
    };
    
    let p = document.createElement('p');
    p.appendChild(new Anchor(
        'Issues',
        {
            data: [{field: 'bs-toggle', value: 'collapse'}],
            attributes: [
                {field: 'href',          value: `#${line_id}`},
                {field: 'role',          value: 'button'},
                {field: 'aria-expanded', value: 'false'},
                {field: 'aria-controls', value: line_id}
            ]
        }
    ).e);
    div_issues.appendChild(p);
    let collapse = document.createElement('div');
    collapse.classList.add('collapse');
    collapse.setAttribute('id', line_id);
    let issue_index = 0;
    line.issues.forEach(issue => {
        let issue_p = document.createElement('p');
        issue_p.innerText = print_date(issue.createdAt);
        issue_p.appendChild(new Number_Input({
            classes: ['issue_input'],
            attributes: [
                {field: 'min',         value: '0'},
                {field: 'max',         value: issue.qty},
                {field: 'value',       value: issue.qty},
                {field: 'placeholder', value: 'Quantity'},
                {field: 'name',        value: `lines[][${index}][issues][${issue_index}][qty]`},
                {field: 'required',    value: true}
            ],
            listener: {event: 'change', func: update_qty}
        }).e);
        issue_p.appendChild(new Hidden_Input({
            attributes: [
                {field: 'value',    value: issue.issue_id},
                {field: 'name',     value: `lines[][${index}][issues][${issue_index}][issue_id]`},
                {field: 'required', value: true}
            ],
            listener: {event: 'change', func: update_qty}
        }).e);
        collapse.appendChild(issue_p);
        issue_index++;
    });
    div_issues .appendChild(collapse);
    div_details.appendChild(div_issues);
    update_qty();
};

function cancel_options() {
    clear(`details_${this.dataset.id}`)
    .then(div_details => {
        if (this.value === '0') {
            get({
                table: 'loancard_line',
                where: {loancard_line_id: this.dataset.id},
                index: this.dataset.index
            })
            .then(function ([line, options]) {
                if (line.status === 1) {
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