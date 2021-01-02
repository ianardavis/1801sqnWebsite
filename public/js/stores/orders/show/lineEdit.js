function getLineActions() {
    let actions = document.querySelectorAll('.actions');
    actions.forEach(e => {
        get(
            function (line, options) {
                if ([2, 3, 4].includes(line._status)) {
                    let opts = [],
                        div_action  = document.createElement('div'),
                        div_actions = document.createElement('div'),
                        div_details = document.createElement('div');
                    opts.push({text: line_statuses[line._status], selected: true});
                    if (line._status === 2) opts.push({value: '3', text: 'Demand'});
                    if (line._status <= 3)  opts.push({value: '4', text: 'Receive'});
                    if (
                        line._status <= 4 &&
                        line.size._issueable
                                          ) opts.push({value: '5', text: 'Issue'});
                    if (line._status === 5) opts.push({value: '6', text: 'Close'});
                    let _status = new Select({
                        attributes: [{field: 'id', value: `sel_${line.line_id}`}],
                        small:   true,
                        options: opts
                    }).e;
                    _status.addEventListener("change", function () {
                        clearElement(`action_${line.line_id}`);
                        clearElement(`details_${line.line_id}`);
                        if (['3', '4', '5', '6'].includes(this.value)) {
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
                        let _cell = document.querySelector(`#details_${line.line_id}`);
                        if (_cell) {
                            _cell.innerHTML = '';
                            add_spinner(_cell, {id: line.line_id});
                            get(
                                function (size, options) {
                                    if      (options.action === '4') showReceiptActions(size, line.line_id);
                                    else if (options.action === '5') showIssueActions(  size, line.line_id);
                                    remove_spinner(line.line_id);
                                },
                                {
                                    table: 'size',
                                    query: [`size_id=${line.size_id}`],
                                    action: this.value
                                }
                            );
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
                table: 'order_line',
                query: [`line_id=${e.dataset.line_id}`]
            }
        );
    });
};
function showReceiptActions(size, line_id) {
    getStock(size.size_id, line_id, 'details', true);
    if (size._serials) getSerials(size.size_id, line_id, 'details', true);
};
function showIssueActions(size, line_id) {
    getStock(size.size_id, line_id, 'details');
    if (size._nsns)    getNSNs(   size.size_id, line_id, 'details', size.nsn_id);
    if (size._serials) getSerials(size.size_id, line_id, 'details');
};