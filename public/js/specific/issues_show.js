function getLines(issue_id, complete, closed, return_permission, delete_permission) {
    let spn_issues = document.querySelector('#spn_issues');
    spn_issues.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#issueTable'),
            line_count = document.querySelector('#line_count');
        if (response.lines) line_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row = table_body.insertRow(-1),
                    cell_line   = row.insertCell(-1),
                    cell_nsn    = row.insertCell(-1),
                    cell_item   = row.insertCell(-1),
                    cell_size   = row.insertCell(-1),
                    cell_qty    = row.insertCell(-1);
                if (complete && !closed) var cell_qty_return = row.insertCell(-1);
                let cell_issue  = row.insertCell(-1),
                    cell_return = row.insertCell(-1),
                    cell_date   = row.insertCell(-1);

                cell_line.innerText = String(line._line).padStart(2, '0');
                if (line.nsn || line.serial) {
                    if (line.nsn) {
                        let nsn_link       = document.createElement('a');
                        nsn_link.href      = 'javascript:show("nsns",' + line.nsn_id + ',{"height":200})';
                        nsn_link.innerText = line.nsn._nsn;
                        cell_nsn.appendChild(nsn_link);
                    };
                    if (line.serial) {
                        cell_nsn.appendChild('<br>');
                        let serial_link       = document.createElement('a');
                        serial_link.href      = 'javascript:show("serials",' + line.serial_id + ',{"height":200})';
                        serial_link.innerText = line.serial._serial;
                        cell_nsn.appendChild(serial_link);
                    };
                };
                
                if (line.size && line.size.item) {
                    cell_item.innerText = line.size.item._description;
                    cell_item.appendChild(link('/stores/items/' + line.size.item_id));
                } else cell_item.innerText = '?';

                if (line.size) {
                    cell_size.innerText = line.size._size;
                    cell_size.appendChild(link('/stores/sizes/' + line.size_id));
                } else cell_size.innerText = '?';

                cell_qty.innerText = line._qty;

                if (line.stock) {
                    cell_issue.innerText = line.stock.location._location;
                    cell_issue.appendChild(link('javascript:show("stock",' + line.stock_id + ',{"height":202})'))
                } else cell_issue.innerText = '?';

                if (line.return) {
                    cell_return.innerText = line.return.stock.location._location;
                    cell_return.appendChild(link('javascript:show("stock",' + line.return.stock_id + ',{"height":202})'))
                } else if (complete && return_permission) {
                    let return_qty = _input({type:'number', name: 'return[line_id' + line.line_id + '][_qty]', value: line._qty})
                    return_qty.max = line._qty;
                    return_qty.min = 1;
                    let select = _select({name: 'return[line_id' + line.line_id + '][stock_id]'});
                    select.appendChild(_option('', '... Select Location'));
                    line.size.stocks.forEach(stock => {
                        select.appendChild(_option(stock.stock_id, stock.location._location));
                    });
                    cell_qty_return.appendChild(return_qty)
                    cell_return.appendChild(select);
                };

                if (line.return) {
                    cell_date.innerText = new Date(line.return.return._date).toDateString();
                    cell_date.appendChild(link('/stores/return_lines/' + line.return_line_id));
                };

                if (delete_permission && !complete && !closed) {
                    let cell_delete = row.insertCell(-1);
                    if (line._status === 'Pending') {
                        cell_delete.appendChild(deleteBtn('/stores/issue_lines/' + line.line_id));
                    };
                };
            });
        } else alert('Error: ' + response.error)
        spn_issues.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting lines'));
    let query = ['issue_id=' + issue_id];
    XHR.open('GET', '/stores/getissuelines?' + query.join('&'));
    XHR.send();
};