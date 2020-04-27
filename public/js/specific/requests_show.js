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
                let row   = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1),
                    cell6 = row.insertCell(-1);
                cell1.innerText = line.size.item._description;
                cell2.innerText = line.size._size;
                cell3.innerText = line._qty;
                cell1.appendChild(link('/stores/items/' + line.size.item_id));
                cell2.appendChild(link('/stores/sizes/' + line.size_id));
                if (line._status === 'Approved') {
                    cell4.innerText = line._status + ' - ' + line._action;
                    cell5.innerText = new Date(line._date).toDateString();
                    cell6.innerText = line.user.rank._rank + ' ' + line.user._name + ', ' + line.user._ini;
                    cell4.appendChild(link('/stores/' + String(line._action).toLowerCase() + '_lines/' + line._id));
                } else if (line._status === 'Declined' || !edit_permission) {
                    cell4.innerText = line._status
                    cell5.innerText = new Date(line._date).toDateString();
                    cell6.innerText = line.user.rank._rank + ' ' + line.user._name + ', ' + line.user._ini;
                } else {
                    cell5.id = 'action_' + line.line_id
                    cell6.id = 'details_' + line.line_id
                    let _status   = document.createElement('select'),
                        _approved = document.createElement('option'),
                        _declined = document.createElement('option'),
                        _pending  = document.createElement('option');
                    _status.classList.add('form-control', 'form-control-sm');
                    _status.id          = 'sel_' + line.line_id;
                    _status.name        = 'actions[line_id' + line.line_id + '][_status]';
                    _approved.value     = 'Approved';
                    _approved.innerText = 'Approved';
                    _declined.value     = 'Declined';
                    _declined.innerText = 'Declined';
                    _pending.value      = 'Pending';
                    _pending.innerText  = 'Pending';
                    _status.appendChild(_pending);
                    _status.appendChild(_approved);
                    _status.appendChild(_declined);
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

                if (delete_permission && !complete && !closed) {
                    let cell8 = row.insertCell(-1);
                    if (line._status === 'Pending') cell8.appendChild(deleteBtn('/stores/request_lines/' + line.line_id));
                };
            });
        } else alert('Error: ' + response.error)
        spn_requests.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting lines'));
    let sel_status = document.querySelector('#sel_status'),
        query      = ['request_id=' + request_id];
    if (sel_status.value !== 'All') query.push('_status=' + sel_status.value);
    XHR.open('GET', '/stores/request_lines?' + query.join('&'));
    XHR.send();
};
function showActions(size_id, line_id) {
    let _action = document.createElement('select'),
        _order  = document.createElement('option'),
        _issue  = document.createElement('option'),
        _blank  = document.createElement('option'),
        _cell  = document.querySelector('#action_' + line_id);
    _action.classList.add('form-control', 'form-control-sm');
    _action.name     = 'actions[line_id' + line_id + '][_action]';
    _action.required = true;
    _blank.value     = '';
    _blank.innerText = '... Select Action';
    _order.value     = 'Order';
    _order.innerText = 'Order';
    _issue.value     = 'Issue';
    _issue.innerText = 'Issue';
    _action.appendChild(_blank);
    _action.appendChild(_order);
    _action.appendChild(_issue);
    _cell.innerHTML = '';
    _action.addEventListener("change", function (event) {
        if (this.value === 'Issue') getStock(size_id, line_id)
        else {
            let _cell = document.querySelector('#details_' + line_id);
            _cell.innerHTML = '';
        };
    });
    _cell.appendChild(_action);

};
function getStock(size_id, line_id) {
    let _cell = document.querySelector('#details_' + line_id);
    _cell.innerHTML = _spinner('line_' + line_id);
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", function(event) {
        let response = JSON.parse(event.target.responseText);
        if (response.result) {
            let _locations = document.createElement('select'),
                _blank  = document.createElement('option');
            _locations.classList.add('form-control', 'form-control-sm');
            _locations.name     = 'actions[line_id' + line_id + '][stock_id]';
            _locations.required = true;
            _blank.value     = '';
            _blank.innerText = '... Select Location';
            _locations.appendChild(_blank);
            response.size.stocks.forEach(stock => {
                let _location = document.createElement('option');
                _location.value     = stock.stock_id;
                _location.innerText = stock.location._location + ', Qty: ' + stock._qty;
                _locations.appendChild(_location);
            });
            _cell.innerHTML = '';
            _cell.appendChild(_locations);
            if (response.size._nsns) {
                let _nsns = document.createElement('select'),
                    _blank_nsn  = document.createElement('option');
                _nsns.classList.add('form-control', 'form-control-sm');
                _nsns.name     = 'actions[line_id' + line_id + '][nsn_id]';
                _nsns.required = true;
                _blank_nsn.value     = '';
                _blank_nsn.innerText = '... Select NSN';
                _nsns.appendChild(_blank_nsn);
                response.size.nsns.forEach(nsn => {
                    let _nsn = document.createElement('option');
                    _nsn.value     = nsn.nsn_id;
                    _nsn.innerText = nsn._nsn;
                    _nsns.appendChild(_nsn);
                });
                _cell.appendChild(_nsns);
            };
            if (response.size._serials) {
                let _serials = document.createElement('select'),
                    _blank_serial  = document.createElement('option');
                _serials.classList.add('form-control', 'form-control-sm');
                _serials.name     = 'actions[line_id' + line_id + '][serial_id]';
                _serials.required = true;
                _blank_serial.value     = '';
                _blank_serial.innerText = '... Select Serial';
                _serials.appendChild(_blank_serial);
                response.size.serials.forEach(serial => {
                    let _serial = document.createElement('option');
                    _serial.value     = serial.serial_id;
                    _serial.innerText = serial._serial;
                    _serials.appendChild(_serial);
                });
                _cell.appendChild(_serials);
            };
        } else {
            _cell.innerHTML = '';
            alert('Error: ' + response.error);
        };
    });
    XHR.addEventListener("error", function(event) {
        _cell.innerHTML = '';
        alert('Oops! Something went wrong.');
    });
    XHR.open('GET', '/stores/getsize/' + size_id);
    XHR.send();
};
function getNSNs(stock_id, size_id, line_id) {
    let _cell = document.querySelector('#details_' + line_id);
    _cell.innerHTML = _spinner('line_' + line_id);
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", function(event) {
        let response = JSON.parse(event.target.responseText);
        if (response.result) {
            let _select = document.createElement('select'),
                _option = document.createElement('option');
            _select.classList.add('form-control', 'form-control-sm');
            _select.name      = 'actions[line_id' + line_id + ']';
            _select.required  = response.result.required;
            _option.value     = '';
            _option.innerText = '... Select NSN';
            _select.appendChild(_option);
            response.nsns.forEach(nsn => {
                let _location = document.createElement('option');
                _location.value     = '{"action":"Issue","stock_id":' + stock_id + ',"nsn_id":' + nsn.nsn_id + '}';
                _location.innerText = nsn._nsn;
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
    XHR.open('GET', '/stores/getnsnsbysize/' + size_id);
    XHR.send();
};
function getSerials(stock_id, size_id, line_id) {
    let _cell = document.querySelector('#details_' + line_id);
    _cell.innerHTML = _spinner('line_' + line_id);
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", function(event) {
        let response = JSON.parse(event.target.responseText);
        if (response.result) {
            let _select = document.createElement('select'),
                _option = document.createElement('option');
            _select.classList.add('form-control', 'form-control-sm');
            _select.name      = 'actions[line_id' + line.line_id + '][]';
            _select.required  = response.result.required;
            _option.value     = '';
            _option.innerText = '... Select NSN';
            _select.appendChild(_option);
            response.nsns.forEach(nsn => {
                let _location = document.createElement('option');
                _location.value     = '{"action":"Issue","stock_id":' + stock_id + ',"nsn_id":' + nsn.nsn_id + '}';
                _location.innerText = nsn._nsn;
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
    XHR.open('GET', '/stores/getnsnsbysize/' + size_id);
    XHR.send();
};