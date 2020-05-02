function getLines(order_id, complete, closed, edit_permission, delete_permission) {
    let spn_orders = document.querySelector('#spn_orders');
    spn_orders.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#orderTable'),
            line_count = document.querySelector('#line_count');
        if (response.lines) line_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row   = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1);
                if (complete) {
                    let cell5 = row.insertCell(-1),
                        cell6 = row.insertCell(-1),
                        cell7 = row.insertCell(-1);
                    if (line.demand_line) {
                        cell5.innerText = new Date(line.demand_line.demand._date).toDateString();
                        cell5.appendChild(link('/stores/demands/' + line.demand_line.demand_id, false))
                        };
                    if (line.receipt_line) {
                        cell6.innerText = new Date(line.receipt_line.receipt._date).toDateString();
                        cell6.appendChild(link('/stores/receipts/' + line.receipt_line.receipt_id, false))
                    };
                    if (Number(line.ordered_for) === -1) {
                        cell7.innerText = 'N/A';
                    } else {
                        if (line.issue_line) {
                            cell7.innerText = new Date(line.issue_line.issue._date).toDateString();
                            cell7.appendChild(link('/stores/issues/' + line.issue_line.issue_id, false))
                        };
                    };
                    let _select  = document.createElement('select'),
                        _demand  = document.createElement('option'),
                        _receive = document.createElement('option'),
                        _issue   = document.createElement('option'),
                        _cancel  = document.createElement('option');
                    _select.classList.add('form-control', 'form-control-sm');
                    _demand.value      = 'Demand';
                    _demand.innerText  = 'Demand';
                    _receive.value     = 'Receive';
                    _receive.innerText = 'Receive';
                    _issue.value       = 'Issue';
                    _issue.innerText   = 'Issue';
                    _cancel.value      = 'Cancel';
                    _cancel.innerText  = 'Cancel';
                    _select.appendChild(_demand);
                    _select.appendChild(_receive);
                    _select.appendChild(_issue);
                    _select.appendChild(_cancel);
                    _select.addEventListener("change", function (event) {
                        if (this.value === 'Receive' || this.value === 'Issue') getStock(line.line_id, this.value);
                    });
                    cell4.appendChild(_select);
                } else {
                    cell4.innerText = line._status;
                };
                cell1.innerText = line.size.item._description;
                cell1.appendChild(link('/stores/items/' + line.size.item_id));
                
                cell2.innerText = line.size._size;
                cell2.appendChild(link('/stores/sizes/' + line.size.size_id));

                cell3.innerText = line._qty;

                if (edit_permission && complete && !closed) {
                    let cell8 = row.insertCell(-1);
                    if (line._status !== 'Cancelled' && line._status !== 'Received') {
                        cell8.appendChild(checkbox({id: line.line_id}));
                    };
                };
                if (delete_permission && !complete && !closed) {
                    let cell9 = row.insertCell(-1);
                    if (line._status === 'Pending') {
                        cell9.appendChild(deleteBtn('/stores/order_lines/' + line.line_id));
                    };
                };
            });
        } else alert('Error: ' + response.error)
        spn_orders.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting lines'));
    let sel_status = document.querySelector('#sel_status'),
        query      = ['order_id=' + order_id];
    if (sel_status.value !== 'All') query.push('_status=' + sel_status.value);
    XHR.open('GET', '/stores/getorderlines?' + query.join('&'));
    XHR.send();
};
function getStock(line_id, _cell) {
    alert(_cell);
};

function getStock1(size_id, line_id) {
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