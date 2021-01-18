function getLineActions() {
    document.querySelectorAll('.actions').forEach(e => {
        get(
            function (line, options) {
                if ([1, 2].includes(line._status)) {
                    let opts = [],
                        div_action  = document.createElement('div'),
                        div_actions = document.createElement('div'),
                        div_details = document.createElement('div');
                    opts.push({text: line_statuses[line._status], selected: true});
                    opts.push({text: 'Cancel', value: '0'});
                    if (line._status === 2) opts.push({text: 'Receive', value: '3'});
                    let _status = new Select({
                        attributes: [{field: 'id', value: `sel_${line.line_id}`}],
                        small:      true,
                        options:    opts
                    }).e;
                    _status.addEventListener("change", function () {
                        clearElement(`action_${line.line_id}`);
                        clearElement(`details_${line.line_id}`);
                        if (this.value === '0' || this.value === '3') {
                            div_action.appendChild(
                                new Hidden({
                                    attributes: [
                                        {field: 'name',  value: `actions[${line.line_id}][_status]`},
                                        {field: 'value', value: this.value}
                                    ]
                                }).e
                            );
                            div_action.appendChild(
                                new Hidden({
                                    attributes: [
                                        {field: 'name',  value: `actions[${line.line_id}][line_id]`},
                                        {field: 'value', value: line.line_id}
                                    ]
                                }).e
                            );
                        };
                        if (this.value === '3') {
                            let _cell = document.querySelector(`#details_${line.line_id}`);
                            if (_cell) {
                                _cell.innerHTML = '';
                                add_spinner(_cell, {id: line.line_id});
                                get(
                                    function (size, options) {
                                        showReceiptActions(size, line.line_id, line._qty);
                                        remove_spinner(line.line_id);
                                    },
                                    {
                                        table: 'size',
                                        query: [`size_id=${line.size_id}`]
                                    }
                                );
                            };
                        };
                    });
                    div_action.setAttribute( 'id', `action_${line.line_id}`);
                    div_details.setAttribute('id', `details_${line.line_id}`);
                    div_actions.appendChild(_status);
                    div_actions.appendChild(div_action);
                    div_actions.appendChild(div_details);
                    e.innerText = '';
                    e.appendChild(div_actions);
                };
            },
            {
                table: 'loancard_line',
                query: [`line_id=${e.dataset.line_id}`]
            }
        );
    });
};
function showReceiptActions(size, line_id, qty = 1) {
    if (size._serials) {
        let _cell = document.querySelector(`#details_${line_id}`);
        add_spinner(_cell, {id: `actions_${line_id}`});
        get(
            function (stocks, options) {
                get(
                    function (serials, options) {
                        let locations = [{value: '', text: '... Select Location'}],
                            _serials = [{value: '', text:  '... Select Serial #'}];
                        serials.forEach(e => _serials.push({value: e.serial_id, text: e._serial}));
                        stocks.forEach(e => locations.push({value: e.stock_id, text: `${e.location._location}, Qty: ${e._qty}`}));
                        
                        for (let i = 0; i < qty; i++) {
                            _cell.appendChild(
                                new Select({
                                    attributes: [
                                        {field: 'name', value: `actions[${line_id}][stocks][${i}][stock_id]`}
                                    ],
                                    small: true,
                                    options: locations
                                }).e
                            );
                            _cell.appendChild(
                                new Input({
                                    attributes: [
                                        {field: 'name',        value: `actions[${line_id}][stocks][${i}][location]`},
                                        {field: 'placeholder', value: 'Enter Location'}
                                    ],
                                    small: true
                                }).e
                            );
                            _cell.appendChild(
                                new Select({
                                    attributes: [
                                        {field: 'name', value: `actions[${line_id}][serials][${i}][serial_id]`}
                                    ],
                                    small: true,
                                    options: _serials
                                }).e
                            );
                            _cell.appendChild(
                                new Input({
                                    attributes: [
                                        {field: 'name',        value: `actions[${line_id}][serials][${i}][serial]`},
                                        {field: 'placeholder', value: 'Enter Serial #'}
                                    ],
                                    small: true
                                }).e
                            );
                            _cell.appendChild(document.createElement('hr'));
                        };
                        remove_spinner(`actions_${line_id}`);
                    },
                    {
                        table: 'serials',
                        query: [`size_id=${size.size_id}`]
                    }
                );
            },
            {
                table: 'stocks',
                query: [`size_id=${size.size_id}`]
            }
        );
    } else getStock(size.size_id, line_id, 'details', true);
};
function getStock(size_id, line_id, cell, entry = false) {
    let _cell = document.querySelector(`#${cell}_${line_id}`);
    add_spinner(_cell, {id: `stocks_${line_id}`});
    get(
        function (stocks, options) {
            let locations = [{value: '', text: '... Select Location'}];
            stocks.forEach(e => locations.push({value: e.stock_id, text: `${e.location._location}, Qty: ${e._qty}`}));
            _cell.appendChild(
                new Select({
                    attributes: [
                        {field: 'name',     value: `actions[${line_id}][stock_id]`},
                        {field: 'required', value: (entry === false)}
                    ],
                    small: true,
                    options: locations
                }).e
            );
            if (entry === true) {
                _cell.appendChild(
                    new Input({
                        attributes: [
                            {field: 'name',        value: `actions[${line_id}][location]`},
                            {field: 'placeholder', value: 'Enter Location'}
                        ],
                        small: true
                    }).e
                );
            };
            remove_spinner(`stocks_${line_id}`);
        },
        {
            table: 'stocks',
            query: [`size_id=${size_id}`]
        }
    );
};
function setActions() {
    let actions_interval = window.setInterval(
        function () {
            if (lines_loaded === true) {
                getLineActions();
                clearInterval(actions_interval);
            }
        },
        500
    );
};
window.addEventListener( "load", function () {
    document.querySelector('#reload').addEventListener('click', setActions);
    addFormListener(
        'form_action',
        'PUT',
        `/stores/loancard_lines/${path[3]}`,
        {
            onComplete: [
                getLines,
                setActions,
                function () {setLineButtons('loancard')}
            ]
        }
    );
});