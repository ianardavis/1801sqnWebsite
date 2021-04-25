function getLineActions() {
    document.querySelectorAll('.actions').forEach(e => {
        get({
            table: 'demand_line',
            query: [`line_id=${e.dataset.id}`]
        })
        .then(function ([line, options]) {
            if ([1, 2].includes(line.status)) {
                let opts = [],
                    div_action  = document.createElement('div'),
                    div_actions = document.createElement('div'),
                    div_details = document.createElement('div');
                opts.push({text: line_statuses[line.status], selected: true});
                opts.push({text: 'Cancel', value: '0'});
                if (line.status === 2) opts.push({text: 'Receive', value: '3'});
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
                                    {field: 'name',  value: `actions[${line.line_id}][status]`},
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
                            get({
                                table: 'size',
                                query: [`size_id=${line.size_id}`]
                            })
                            .then(function ([size, options]) {
                                showReceiptActions(size, line.line_id, line._qty);
                                remove_spinner(line.line_id);
                            });
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
        });
    });
};
function showReceiptActions(size, line_id, qty = 1) {
    if (size.has_serials) {
        let _cell = document.querySelector(`#details_${line_id}`);
        add_spinner(_cell, {id: `actions_${line_id}`});
        get({
            table: 'stocks',
            query: [`size_id=${size.size_id}`]
        })
        .then(function ([stocks, options]) {
            get({
                table: 'serials',
                query: [`size_id=${size.size_id}`]
            })
            .then(function ([serials, options]) {
                let locations = [{value: '', text: '... Select Location'}],
                    _serials  = [{value: '', text:  '... Select Serial #'}];
                serials.forEach(e => _serials.push({value: e.serial_id, text: e.serial}));
                stocks.forEach(e => locations.push({value: e.stock_id,  text: `${e.location.location}, Qty: ${e.qty}`}));
                
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
            });
        });
    } else getStock(size.size_id, line_id, 'details', true);
};
function getStock(size_id, line_id, cell, entry = false) {
    let _cell = document.querySelector(`#${cell}_${line_id}`);
    add_spinner(_cell, {id: `stocks_${line_id}`});
    get({
        table: 'stocks',
        query: [`size_id=${size_id}`]
    })
    .then(function ([stocks, options]) {
        let locations = [{value: '', text: '... Select Location'}];
        stocks.forEach(e => locations.push({value: e.stock_id, text: `${e.location.location}, Qty: ${e.qty}`}));
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
    });
};
function setLineButtons() {
    get({
        table: 'demand',
        query: [`demand_id=${path[2]}`]
    })
    .then(function([demand, options]) {
        disable_button('action');
        disable_button('size_add');
        if      (demand.status === 1) enable_button('size_add');
        else if (demand.status === 2) enable_button('action');
    });
};
window.addEventListener( "load", function () {
    addFormListener(
        'action',
        'PUT',
        `/demand_lines/${path[2]}`,
        {
            onComplete: [
                getLines,
                setActions,
                setLineButtons
            ]
        }
    );
});