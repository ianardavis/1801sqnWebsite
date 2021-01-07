function getLineActions() {
    document.querySelectorAll('.actions').forEach(e => {
        get(
            function (line, options) {
                if (line._status === 2) {
                    let opts = [];
                    opts.push({text: 'Open', selected: true});
                    opts.push({text: 'Approve', value: '3'});
                    opts.push({text: 'Decline', value: '4'});
                    e.innerText = '';
                    e.appendChild(new Select({
                        attributes: [{field: 'id', value: `sel_${line.line_id}`}],
                        small: true,
                        options: opts,
                        listener: {
                            event: 'change',
                            func: function () {
                                clearElement(`action_${line.line_id}`);
                                clearElement(`hidden_${line.line_id}`);
                                clearElement(`details_${line.line_id}`);
                                if      (this.value === '4') add_hidden(line.line_id, '4');
                                else if (this.value === '3') showActions(line.size_id, line.line_id);
                            }
                        }
                    }).e);
                    ['hidden', 'action', 'details'].forEach(d => {
                        let div = document.createElement('div');
                        div.setAttribute('id', `${d}_${line.line_id}`);
                        e.appendChild(div);
                    });
                    e.removeAttribute('class');
                    e.removeAttribute('data-line_id');
                };
            },
            {
                table: 'request_line',
                query: [`line_id=${e.dataset.line_id}`]
            }
        );
    });
};
function add_hidden(line_id, _status) {
    let div_hidden = document.querySelector(`#hidden_${line_id}`);
    if (div_hidden) {
        div_hidden.appendChild(
            new Hidden({
                attributes: [
                    {field: 'name',  value: `actions[${line_id}][_status]`},
                    {field: 'value', value: _status}
                ]
            }).e
        );
        div_hidden.appendChild(
            new Hidden({
                attributes: [
                    {field: 'name',  value: `actions[${line_id}][line_id]`},
                    {field: 'value', value: line_id}
                ]
            }).e
        );
    };
};
function showActions(size_id, line_id) {
    let _cell = document.querySelector(`#action_${line_id}`);
    if (_cell) {
        _cell.innerHTML = '';
        add_hidden(line_id, '3');
        add_spinner(_cell, {id: line_id});
        get(
            function (size, options) {
                let opts = [{text: '... Select Action', selected: true}];
                if (size._orderable) opts.push({value: 'Order', text: 'Order'});
                if (size._issueable) opts.push({value: 'Issue', text: 'Issue'});
                _cell.appendChild(new Select({
                    attributes: [
                        {field: 'name',     value: `actions[${line_id}][_action]`},
                        {field: 'required', value: true}
                    ],
                    small: true,
                    options: opts,
                    listener: {
                        event: 'change',
                        func: function () {
                            if (this.value === 'Issue') {
                                getStock(size_id, line_id, 'details');
                                if (size._nsns)    getNSNs(   size_id, line_id, 'details', size.nsn_id);
                                if (size._serials) getSerials(size_id, line_id, 'details');
                            } else clearElement(`details_${line_id}`);
                        }
                    }
                }).e);
                remove_spinner(line_id);
            },
            {
                table: 'size',
                query: [`size_id=${size_id}`]
            }
        );
    };
};
window.addEventListener( "load", function () {
    addFormListener(
        'form_action',
        'PUT',
        `/stores/request_lines/${path[3]}`,
        {
            onComplete: [
                getLines,
                setActions,
                function () {setLineButtons('request')}
            ]
        }
    );
});