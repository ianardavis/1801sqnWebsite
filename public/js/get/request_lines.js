function getRequestLines(request_id, complete, edit_permission, delete_permission) {
    show_spinner('requests');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#requestTable'),
            line_count = document.querySelector('#line_count');
        if (response.lines) line_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row = table_body.insertRow(-1);
                add_cell(row, {
                    text: line.size.item._description,
                    append: link('/stores/items/' + line.size.item_id)
                });
                add_cell(row, {
                    text: line.size._size,
                    append: link('/stores/sizes/' + line.size_id)
                });
                add_cell(row, {text: line._qty});
                let cell4 = row.insertCell(-1);
                if (complete) {
                    let cell5 = row.insertCell(-1),
                        cell6 = row.insertCell(-1);
                    if (line._status === 'Approved') {
                        cell4.innerText = line._status + ' - ' + line._action;
                        cell5.innerText = new Date(line._date).toDateString();
                        cell6.innerText = line.user.rank._rank + ' ' + line.user.full_name;
                        cell4.appendChild(link('/stores/' + String(line._action).toLowerCase() + '_lines/' + line._id));
                    } else if (line._status === 'Declined' || !edit_permission) {
                        cell4.innerText = line._status
                        if (line._date) cell5.innerText = new Date(line._date).toDateString();
                        if (line.user)  cell6.innerText = line.user.rank._rank + ' ' + line.user.full_name;
                    } else {
                        cell5.id = 'action_' + line.line_id
                        cell6.id = 'details_' + line.line_id
                        let _status = _select({
                                name: 'actions[line_id' + line.line_id + '][_status]',
                                id:   'sel_' + line.line_id
                            });
                        _status.appendChild(_option({value: '', text: 'Open'}));
                        _status.appendChild(_option({value: 'Approved', text: 'Approved'}));
                        _status.appendChild(_option({value: 'Declined', text: 'Declined'}));
                        _status.addEventListener("change", function (event) {
                            if (this.value === 'Approved') showActions(line.size_id, line.line_id)
                            else {
                                let _cell  = document.querySelector('#action_' + line.line_id),
                                    _cell2 = document.querySelector('#details_' + line.line_id);
                                _cell.innerHTML  = '';
                                _cell2.innerHTML = '';
                            }
                        });
                        cell4.appendChild(_status);
                    };
                } else {
                    cell4.innerText = line._status
                    if (delete_permission) {
                        let cellDelete = row.insertCell(-1);
                        cellDelete.appendChild(deleteBtn('/stores/request_lines/' + line.line_id));
                    };
                };
            });
        } else alert('Error: ' + response.error);
        hide_spinner('requests');
    });
    let sel_status = document.querySelector('#sel_status'),
        query      = ['request_id=' + request_id];
    if (complete && sel_status.value !== 'All') query.push('_status=' + sel_status.value);
    XHR_send(XHR, 'requests', '/stores/request_lines?' + query.join('&'));
};