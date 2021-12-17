function enable_radios(table) {
    let radios = table.querySelectorAll('input[type="radio"]');
    radios.forEach(e => e.removeAttribute('disabled'));
};
function addEditSelect() {
    hide('sel_all');
    let cells = document.querySelectorAll('.actions'),
        actions = [];
    cells.forEach(cell => {
        actions.push(
            new Promise(resolve => {
                get({
                    table: 'loancard_line',
                    where: {loancard_line_id: cell.dataset.id}
                })
                .then(function ([line, options]) {
                    if ([1, 2].includes(line.status)) {
                        cell.innerHTML = '';
                        cell.appendChild(new Hidden({
                            attributes: [
                                {field: 'name',  value: `lines[][${cell.dataset.index}][loancard_line_id]`},
                                {field: 'value', value: line.loancard_line_id}
                            ]
                        }).e);
                        let options = [{text: line_statuses[line.status], selected: true}];
                        if (line.status === 1) options.push({text: 'Cancel', value: '0'});
                        if (line.status === 2) options.push({text: 'Return', value: '3'});
                        let select = new Select({
                            attributes: [
                                {field: 'id',         value: `line_${line.loancard_line_id}`},
                                {field: 'name',       value: `lines[][${cell.dataset.index}][status]`},
                                {field: 'data-id',    value: line.loancard_line_id},
                                {field: 'data-index', value: cell.dataset.index}
                            ],
                            classes: ['line_action'],
                            small: true,
                            options: options
                        }).e
                        select.addEventListener('change', returnOptions);
                        cell.appendChild(select);
                        cell.appendChild(new Div({attributes: [{field: 'id', value: `line_${line.loancard_line_id}_details`}]}).e);
                        resolve(true);
                    } else resolve(false);
                })
                .catch(err => {
                    console.log(err);
                    resolve(false);
                });
            })
        );
    });
    Promise.all(actions)
    .then(result => show('sel_all'));
};
function return_options() {
    clear(`${this.dataset.loancard_line_id}_details`)
    .then(div_details => {
        if (this.value === '3' && this.checked) {
            get({
                table: 'loancard_line',
                where: {loancard_line_id: this.dataset.loancard_line_id},
                index: this.dataset.index
            })
            .then(function ([line, options]) {
                if (line.status === 2) {
                    if (line.size.has_serials) {
                        get({
                            table: 'current_serials',
                            where: {size_id: line.size_id},
                            index: options.index
                        })
                        .then(function ([serials, options]) {
                            let serial_options = [{text: 'Select Serial #'}];
                            serials.forEach(e => serial_options.push({text: e.serial, value: e.serial_id}));
                            for (let i = 0; i < line.qty; i++) {
                                div_details.appendChild(new Select({
                                    small: true,
                                    attributes: [
                                        {field: 'name',     value: `lines[][${options.index}][serials][][${i}][serial_id]`},
                                        {field: 'required', value: true}
                                    ],
                                    options: serial_options
                                }).e);
                            };
                        });
                    } else {
                        let location = new Input({
                            small: true,
                            attributes: [
                                {field: 'name',        value: `lines[][${options.index}][location]`},
                                {field: 'required',    value: true},
                                {field: 'placeholder', value: 'Location'},
                                {field: 'list',        value: `locations_${options.index}`}
                            ],
                            options: [{text: 'Select Location'}]
                        }).e;
                        let stock_qty = new Input({
                            small: true,
                            attributes: [
                                {field: 'type',        value: 'number'},
                                {field: 'min',         value: '1'},
                                {field: 'max',         value: line.qty},
                                {field: 'value',       value: line.qty},
                                {field: 'Placeholder', value: 'Quantity'},
                                {field: 'name',        value: `lines[][${options.index}][qty]`},
                                {field: 'required',    value: true}
                            ]
                        }).e;
                        div_details.appendChild(location);
                        div_details.appendChild(stock_qty);
                        get({
                            table: 'stocks',
                            where: {size_id: line.size_id},
                            index: options.index
                        })
                        .then(function ([stocks, options]) {
                            let locations_list = document.createElement('datalist'), locs = [];
                            locations_list.setAttribute('id', `locations_${options.index}`);
                            stocks.forEach(e => {
                                if (!locs.includes(e.location.location)) {
                                    locs.push(e.location.location);
                                    locations_list.appendChild(new Option({value: e.location.location}).e)
                                };
                                div_details.appendChild(locations_list);
                            });
                        });
                    };
                };
            });
        };
    })
};
function setActionButton(status) {
    if ([1,2].includes(status)) enable_button('lines_action');
};
function select_all() {
    if (this.value !== 'Select All') {
        document.querySelectorAll('.line_action').forEach(select => {
            if (select.innerHTML.indexOf(`value="${this.value}"`) !== -1) {
                if (!select.value) {
                    select.value = String(this.value);
                    returnOptions.call(select);
                };
            };
        });
    };
};
window.addEventListener( "load", function () {
    addListener('sel_all', select_all, 'change');
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