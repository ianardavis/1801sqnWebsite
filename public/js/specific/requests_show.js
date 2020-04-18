function getLines(request_id, complete, closed, edit_permission, delete_permission) {
    let spn_requests = document.querySelector('#spn_requests');
    spn_requests.style.display = 'block';
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
                let cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1),
                    cell6 = row.insertCell(-1);
                cell1.innerText = line.size.item._description;
                cell1.appendChild(link('/stores/items/' + line.size.item_id));
                
                cell2.innerText = line.size._size;
                cell2.appendChild(link('/stores/sizes/' + line.size_id));

                cell3.innerText = line._qty;

                if (line._status === 'Approved') {
                    cell4.innerText = line._status + ' - ' + line._action;
                    cell4.appendChild(link('/stores/' + String(line._action).toLowerCase() + 's/' + line._id, false));
                    cell5.innerText = new Date(line._date).toDateString();
                    cell6.innerText = line.user.rank._rank + ' ' + line.user._name + ', ' + line.user._ini;
                } else if (!edit_permission) {
                    cell4.innerText = line._status
                } else {
                    cell5.id = 'action_' + line.line_id
                    let _select = document.createElement('select'),
                        _approved = document.createElement('option'),
                        _declined = document.createElement('option'),
                        _pending  = document.createElement('option');
                    _select.classList.add('form-control', 'form-control-sm');
                    _select.id = 'sel_' + line.line_id;
                    _approved.value = 'Approved';
                    _approved.innerText = 'Approved';
                    _declined.value = 'Declined';
                    _declined.innerText = 'Declined';
                    _pending.value = 'Pending';
                    _pending.innerText = 'Pending';
                    _pending.selected = true;
                    _select.appendChild(_pending);
                    _select.appendChild(_approved);
                    _select.appendChild(_declined);
                    _select.addEventListener("change", function (event) {
                        if (this.value === 'Approved') getStock(line.size_id, line.line_id)
                        else {
                            let _cell = document.querySelector('#action_' + line.line_id);
                            _cell.innerHTML = '';
                        }
                    });
                    cell4.appendChild(_select);
                };

                if (delete_permission && !complete && !closed) {
                    let cell8 = row.insertCell(-1);
                    if (line._status === 'Pending') {
                        cell8.appendChild(deleteBtn('/stores/request_lines/' + line.line_id));
                    };
                };
            });
        } else alert('Error: ' + response.error)
        spn_requests.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting lines'));
    let sel_status = document.querySelector('#sel_status'),
        query      = ['request_id=' + request_id];
    if (sel_status.value !== 'All') query.push('_status=' + sel_status.value);
    XHR.open('GET', '/stores/getrequestlines?' + query.join('&'));
    XHR.send();
};
function getStock(size_id, line_id) {
    let _cell = document.querySelector('#action_' + line_id);
    _cell.innerHTML = _spinner('line_' + line_id);
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", function(event) {
        let response = JSON.parse(event.target.responseText);
        if (response.result) {
            let _select = document.createElement('select'),
                _order  = document.createElement('option');
            _select.classList.add('form-control', 'form-control-sm');
            _select.name     = 'actions[]'
            _order.value     = '{"action":"Order","line_id":' + line_id + '}';
            _order.innerText = 'Order';
            _select.appendChild(_order);
            response.stock.forEach(stk => {
                let _location = document.createElement('option');
                _location.value     = '{"action":"Issue","line_id":' + line_id + ',"stock_id":' + stk.stock_id + '}';
                _location.innerText = 'Issue - Location: ' + stk.location._location + ', Qty: ' + stk._qty;
                _select.appendChild(_location);
            });
            _cell.innerHTML = '';
            _cell.appendChild(_select);
        } else {
            _cell.innerHTML = '';
            alert('Error: ' + response.error);
        };
    });
    XHR.addEventListener("error", function(event) {
        _cell.innerHTML = '';
        alert('Oops! Something went wrong.');
    });
    let query = ['size_id=' + size_id];
    XHR.open('GET', '/stores/getstock?' + query.join('&'));
    XHR.send();
  };