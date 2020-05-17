function getLines(demand_id, complete, delete_permission) {
    let spn_demands = document.querySelector('#spn_demands');
    spn_demands.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#demandTable'),
            line_count = document.querySelector('#line_count');
        if (response.lines) line_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row = table_body.insertRow(-1);
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1);
                cell1.innerText = line.line_id
                cell2.innerText = line.size.item._description;
                cell2.appendChild(link('/stores/items/' + line.size.item_id));
                
                cell3.innerText = line.size._size;
                cell3.appendChild(link('/stores/sizes/' + line.size.size_id));

                cell4.innerText = line._qty;
                if (complete) {
                    let cell6 = row.insertCell(-1)
                    if (line._status === 'Open') {
                        let select = _select({
                            name: 'actions[line_id' + line.line_id + '][_status]'
                        });
                        select.appendChild(_option('', 'Open'));
                        select.appendChild(_option('Receive', 'Receive'));
                        select.appendChild(_option('Cancel', 'Cancel'));
                        select.addEventListener("change", function (event) {
                            if (this.value === 'Receive') getStock(line.size_id, line.line_id)
                            else {
                                let _cell  = document.querySelector('#stock' + line.line_id);
                                _cell.innerHTML  = '';
                            }
                        });
                        cell5.appendChild(select);
    
                        cell6.id = 'stock' + line.line_id;
                    } else {
                        cell5.innerText = line._status;
                        if (line.receipt_line) {
                            cell6.innerText = new Date(line.receipt_line.receipt._date).toDateString();
                            cell6.append(link('/stores/receipts/' + line.receipt_line.receipt_id));
                        };

                    };
                } else {
                    cell5.innerText = line._status;
                };

                if (delete_permission && !complete) {
                    let cell6 = row.insertCell(-1);
                    if (line._status === 'Pending') {
                        cell6.appendChild(deleteBtn('/stores/demand_lines/' + line.line_id));
                    };
                };
            });
        } else alert('Error: ' + response.error)
        spn_demands.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting lines'));
    let sel_status = document.querySelector('#sel_status'),
        query      = ['demand_id=' + demand_id];
    if (sel_status.value !== 'All') query.push('_status=' + sel_status.value);
    XHR.open('GET', '/stores/getdemandlines?' + query.join('&'));
    XHR.send();
};

function getStock(size_id, line_id, action) {
    let _cell = document.querySelector('#stock' + line_id);
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
            if (response.size._serials) {
                let _serials = _input({
                    name: 'actions[line_id' + line_id + '][_serial]',
                    placeholder: 'Enter Serial #'
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