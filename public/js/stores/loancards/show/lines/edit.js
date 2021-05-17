function getLineActions() {
    document.querySelectorAll('.actions').forEach(e => {
        get({
            table: 'loancard_line',
            query: [`line_id=${e.dataset.line_id}`]
        })
        .then(function ([line, options]) {
            if ([1, 2].includes(line.status)) {
                let opts = [],
                    div_action  = document.createElement('div'),
                    div_actions = document.createElement('div'),
                    div_details = document.createElement('div');
                opts.push({text: line_statuses[line.status], selected: true});
                if (line.status === 1) opts.push({text: 'Cancel', value: '0'});
                if (line.status === 2) opts.push({text: 'Return', value: '3'});
                let status = new Select({
                    attributes: [
                        {field: 'id', value: `sel_${line.line_id}`}
                    ],
                    small:      true,
                    options:    opts,
                    listener:   {
                        event: 'change',
                        func:  function () {
                            clearElement(`action_${line.line_id}`);
                            clearElement(`details_${line.line_id}`);
                            if (this.value === '3' || this.value === '0') {
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
                                        {
                                            table: 'size',
                                            query: [`size_id=${line.size_id}`]
                                        },
                                        function (size, options) {
                                            showReturnActions(size, line.line_id, line._qty);
                                            remove_spinner(line.line_id);
                                        }
                                    );
                                };
                            };
                        }
                    }
                }).e;
                div_action .setAttribute('id', `action_${line.line_id}`);
                div_details.setAttribute('id', `details_${line.line_id}`);
                div_actions.appendChild(status);
                div_actions.appendChild(div_action);
                div_actions.appendChild(div_details);
                e.innerText = '';
                e.appendChild(div_actions);
            };
        });
    });
};
function showReturnActions(size, line_id, qty = 1) {
    let _cell = document.querySelector(`#details_${line_id}`);
    add_spinner(_cell, {id: `stocks_${line_id}`});
    get({
        table: 'stocks',
        query: [`size_id=${size.size_id}`]
    })
    .then(function ([stocks, options]) {
        let locations = [{value: '', text: '... Select Location'}];
        stocks.forEach(e => locations.push({value: e.location_id, text: `${e.location.location}, Qty: ${e.qty}`}));
        locations.push({value: 'enter', text: 'Manual Entry'});
        _cell.appendChild(
            new Select({
                attributes: [
                    {field: 'id',       value: `sel_location_${line_id}`},
                    {field: 'name',     value: `actions[${line_id}][location][location_id]`},
                    {field: 'required', value: true}
                ],
                small: true,
                options: locations,
                listener: {
                    event: 'change',
                    func: function () {
                        let inp_location = document.querySelector(`#inp_location_${line_id}`),
                            sel_location = document.querySelector(`#sel_location_${line_id}`);
                        if (inp_location) {
                            if (this.value === 'enter') {
                                inp_location.classList.remove('hidden');
                                inp_location.setAttribute('name', `actions[${line_id}][location][_location]`);
                                inp_location.setAttribute('required', true);
                                sel_location.removeAttribute('name');
                                sel_location.removeAttribute('required');
                            } else {
                                inp_location.classList.add('hidden');
                                inp_location.removeAttribute('name');
                                inp_location.removeAttribute('required');
                                sel_location.setAttribute('name', `actions[${line_id}][location][location_id]`);
                                sel_location.setAttribute('required', true);
                            };
                        };
                    }
                }
            }).e
        );
        _cell.appendChild(
            new Input({
                attributes: [
                    {field: 'id',          value: `inp_location_${line_id}`},
                    {field: 'placeholder', value: 'Enter Location'}
                ],
                small:   true,
                classes: ['hidden']
            }).e
        );
        remove_spinner(`stocks_${line_id}`);
    });
};
function setActions() {
    let actions_interval = window.setInterval(
        function () {
            if (lines_loaded === true) {
                getLineActions();
                clearInterval(actions_interval);
            };
        },
        500
    );
};
function setLineButtons() {
    get({
        table: 'loancard',
        query: [`loancard_id=${path[2]}`]
    })
    .then(function([loancard, options]) {
        disable_button('action');
        if (loancard.status === 1 || loancard.status === 2) enable_button('action');
    });
};