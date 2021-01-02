function getLineActions() {
    let actions = document.querySelectorAll('.actions');
    actions.forEach(e => {
        get(
            function (line, options) {
                if (line._status === 2) {
                    let opts = [],
                        div_actions = document.createElement('div'),
                        div_action  = document.createElement('div'),
                        div_details = document.createElement('div');
                    opts.push({text: 'Open',    selected: true});
                    opts.push({text: 'Approve', value: '3'});
                    opts.push({text: 'Decline', value: '4'});
                    let _status = new Select({
                        attributes: [{field: 'id', value: `sel_${line.line_id}`}],
                        small: true,
                        options: opts
                    }).e;
                    _status.addEventListener("change", function () {
                        clearElement(`action_${line.line_id}`);
                        clearElement(`details_${line.line_id}`);
                        if (this.value === '4') {
                            div_action.appendChild(
                                new Hidden({
                                    attributes: [
                                        {field: 'name',  value: `actions[${line.line_id}][_status]`},
                                        {field: 'value', value: '4'}
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
                        } else if (this.value === '3') {
                            showActions(line.size_id, line.line_id);
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
                table: 'request_line',
                query: [`line_id=${e.dataset.line_id}`]
            }
        );
    });
};
function showActions(size_id, line_id) {
    let _cell = document.querySelector(`#action_${line_id}`);
    if (_cell) {
        _cell.innerHTML = '';
        _cell.appendChild(
            new Hidden({
                attributes: [
                    {field: 'name',  value: `actions[${line_id}][_status]`},
                    {field: 'value', value: '3'}
                ]
            }).e
        );
        _cell.appendChild(
            new Hidden({
                attributes: [
                    {field: 'name',  value: `actions[${line_id}][line_id]`},
                    {field: 'value', value: line_id}
                ]
            }).e
        );
        add_spinner(_cell, {id: line_id});
        get(
            function (size, options) {
                let opts = [{text: '... Select Action', selected: true}];
                if (size._orderable) opts.push({value: 'Order', text: 'Order'});
                if (size._issueable) opts.push({value: 'Issue', text: 'Issue'});
                let _action = new Select({
                    attributes: [
                        {field: 'name',     value: `actions[${line_id}][_action]`},
                        {field: 'required', value: true}
                    ],
                    small: true,
                    options: opts
                }).e;
                _action.addEventListener("change", function () {
                    if (this.value === 'Issue') {
                        getStock(size_id, line_id, 'details');
                        if (size._nsns)    getNSNs(   size_id, line_id, 'details', size.nsn_id);
                        if (size._serials) getSerials(size_id, line_id, 'details');
                    } else clearElement(`details_${line_id}`);
                });
                _cell.appendChild(_action);
                remove_spinner(line_id);
            },
            {
                table: 'size',
                query: [`size_id=${size_id}`]
            }
        );
    };
};