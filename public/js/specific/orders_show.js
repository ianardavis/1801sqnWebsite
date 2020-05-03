function getLines(order_id, complete, closed, delete_permission) {
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
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1);
                if (complete) {
                    let cell6 = row.insertCell(-1),
                        cell7 = row.insertCell(-1),
                        cell8 = row.insertCell(-1);
                    if (line._status === 'Open') {
                        var select  = _select({
                            name: 'actions[line_id' + line.line_id + '][_status]'
                        });
                        select.appendChild(_option('',   '... Action'));
                    };
                    if (line.demand_line_id) {
                        if (line.demand_line) {
                            cell6.innerText = new Date(line.demand_line.demand._date).toDateString();
                            cell6.appendChild(link('/stores/demands/' + line.demand_line.demand_id));
                        } else {
                            cell6.innerText = 'N/A';
                        };
                    } else if (line._status === 'Open') {
                        if (!line.receipt_line_id && !line.issue_line_id) {
                            select.appendChild(_option('Demand', 'Demand'));
                        };
                    };
                    if (line.receipt_line_id) {
                        if (line.receipt_line) {
                            cell7.innerText = new Date(line.receipt_line.receipt._date).toDateString();
                            cell7.appendChild(link('/stores/receipts/' + line.receipt_line.receipt_id));
                        } else {
                            cell7.innerText = 'N/A';
                        };
                    } else if (line._status === 'Open') {
                        if (!line.issue_line_id) {
                            cell7.id = 'Receive' + line.line_id;
                            select.appendChild(_option('Receive', 'Receive'));
                        };
                    };
                    if (Number(line.order.ordered_for) === -1) {
                        cell8.innerText = 'N/A';
                    } else {
                        if (line.issue_line_id) {
                            if (line.issue_line) {
                                cell8.innerText = new Date(line.issue_line.issue._date).toDateString();
                                cell8.appendChild(link('/stores/issues/' + line.issue_line.issue_id));
                            } else {
                                cell8.innerText = 'N/A';
                            };
                        } else if (line._status === 'Open') {
                            cell8.id = 'Issue' + line.line_id;
                            select.appendChild(_option('Issue', 'Issue'));
                        };
                    };
                    if (line._status === 'Open') {
                        select.appendChild(_option('Cancel', 'Cancel'));
                        select.addEventListener("change", function (event) {
                            if (!line.issue_line)   cell8.innerText = '';
                            if (!line.receipt_line) cell7.innerText = '';
                            if (this.value === 'Receive' || this.value === 'Issue') getStock(line.size_id, line.line_id, this.value);
                        });
                        cell5.appendChild(select)
                    } else {
                        cell5.innerText = line._status;
                    };
                } else {
                    cell5.innerText = line._status;
                };
                cell1.innerText = line.line_id;

                cell2.innerText = line.size.item._description;
                cell2.appendChild(link('/stores/items/' + line.size.item_id));
                
                cell3.innerText = line.size._size;
                cell3.appendChild(link('/stores/sizes/' + line.size.size_id));

                cell4.innerText = line._qty;

                if (delete_permission && !complete && !closed) {
                    let cell10 = row.insertCell(-1);
                    if (line._status === 'Pending') {
                        cell10.appendChild(deleteBtn('/stores/order_lines/' + line.line_id));
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

function getStock(size_id, line_id, action) {
    let _cell = document.querySelector('#' + action + line_id);
    _cell.innerHTML = _spinner('line_' + line_id);
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", function(event) {
        let response = JSON.parse(event.target.responseText);
        if (response.result) {
            let _locations = _select({
                name: 'actions[line_id' + line_id + '][stock_id]',
                required: true
            });
            _locations.required = true;
            _locations.appendChild(_option('', '... Select Location'));
            response.size.stocks.forEach(stock => {
                _locations.appendChild(_option(stock.stock_id, stock.location._location + ', Qty: ' + stock._qty));
            });
            _cell.innerHTML = '';
            _cell.appendChild(_locations);
            if (response.size._nsns && action === 'Issue') {
                let _nsns = _select({
                    name: 'actions[line_id' + line_id + '][nsn_id]',
                    required: true
                });
                _nsns.required = true;
                _nsns.appendChild(_option('', '... Select NSN'));
                response.size.nsns.forEach(nsn => {
                    _nsns.appendChild(_option(nsn.nsn_id, nsn._nsn));
                });
                _cell.appendChild(_nsns);
            };
            if (response.size._serials) {
                let _serials = null
                if (action === 'Receive') {
                    _serials = _input({
                        name: 'actions[line_id' + line_id + '][_serial]',
                        placeholder: 'Enter Serial #'
                    });
                } else if (action === 'Issue') {
                    _serials = _select({
                        name: 'actions[line_id' + line_id + '][serial_id]',
                        required: true
                    });
                    _serials.required = true;
                    _serials.appendChild(_option('', '... Select Serial'));
                    response.size.serials.forEach(serial => {
                        _serials.appendChild(_option(serial.serial_id, serial._serial));
                    });
                };
                _cell.appendChild(_serials);
            };
            if (action === 'Issue') {
                let newDate = new Date(),
                    dd = String(newDate.getDate()).padStart(2, '0'),
                    MM = String(newDate.getMonth() + 1).padStart(2, '0'),
                    yyyy = newDate.getFullYear() + 7;
                _cell.appendChild(
                    _input({
                        name:        'actions[line_id' + line_id + '][_due_date]',
                        type:        'date',
                        placeholder: '... Select Due Date',
                        value:       yyyy + '-' + MM + '-' + dd
                    })
                )
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