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
                    if (line._status === 1) opts.push({text: 'Cancel', value: '0'});
                    if (line._status === 2) opts.push({text: 'Return', value: '3'});
                    let _status = new Select({
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
                                                function (size, options) {
                                                    showReturnActions(size, line.line_id, line._qty);
                                                    remove_spinner(line.line_id);
                                                },
                                                {
                                                    table: 'size',
                                                    query: [`size_id=${line.size_id}`]
                                                }
                                            );
                                        };
                                    };
                                }
                            }
                        }).e;
                    div_action .setAttribute('id', `action_${line.line_id}`);
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
function showReturnActions(size, line_id, qty = 1) {
    let _cell = document.querySelector(`#details_${line_id}`);
    add_spinner(_cell, {id: `stocks_${line_id}`});
    get(
        function (stocks, options) {
            let locations = [{value: '', text: '... Select Location'}];
            stocks.forEach(e => locations.push({value: e.stock_id, text: `${e.location._location}, Qty: ${e._qty}`}));
            _cell.appendChild(
                new Select({
                    attributes: [
                        {field: 'name', value: `actions[${line_id}][stock_id]`}
                    ],
                    small: true,
                    options: locations
                }).e
            );
            _cell.appendChild(
                new Input({
                    attributes: [
                        {field: 'name',        value: `actions[${line_id}][location]`},
                        {field: 'placeholder', value: 'Enter Location'}
                    ],
                    small: true
                }).e
            );
            remove_spinner(`stocks_${line_id}`);
        },
        {
            table: 'stocks',
            query: [`size_id=${size.size_id}`]
        }
    );
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
    get(
        function(loancard, options) {
            set_attribute({id: `btn_action`, attribute: 'disabled', value: true});
            if (loancard._status === 1 || loancard._status === 2) remove_attribute({id: 'btn_action', attribute: 'disabled'});
        },
        {
            table: 'loancard',
            query: [`loancard_id=${path[3]}`]
        }
    );
};