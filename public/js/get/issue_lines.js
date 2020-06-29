function getIssueLines(issue_id, complete, closed, return_permission, delete_permission) {
    show_spinner('issues');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#issueTable'),
            line_count = document.querySelector('#line_count');
        if (response.lines) line_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row = table_body.insertRow(-1);
                add_cell(row, {text: String(line._line).padStart(2, '0')});
                let cell_nsn = row.insertCell(-1)
                if (line.nsn || line.serial) {
                    if (line.nsn) {
                        let nsn_link       = document.createElement('a');
                        nsn_link.href      = 'javascript:show("nsns",' + line.nsn_id + ',{"height":200})';
                        nsn_link.innerText = line.nsn._nsn;
                        add_cell(row, {append: nsn_link})
                        cell_nsn.appendChild();
                    }
                    if (line.serial) {
                        cell_nsn.appendChild('<br>');
                        let serial_link       = document.createElement('a');
                        serial_link.href      = 'javascript:show("serials",' + line.serial_id + ',{"height":200})';
                        serial_link.innerText = line.serial._serial;
                        cell_nsn.appendChild(serial_link);
                    };
                };
                
                if (line.size && line.size.item) {
                    add_cell(row, {
                        text: line.size.item._description,
                        append: link('/stores/items/' + line.size.item_id)
                    });
                } else add_cell(row, {text: '?'});

                if (line.size) {
                    add_cell(row, {
                        text: line.size._size,
                        append: link('/stores/sizes/' + line.size_id)
                    })
                } else add_cell(row, {text: '?'});

                add_cell(row, {text: line._qty});

                if (complete && !closed) var cell_qty_return = row.insertCell(-1);
                let cell_issue  = row.insertCell(-1),
                    cell_return = row.insertCell(-1);
                    
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
                    add_cell(row, {
                        text: new Date(line.return.return._date).toDateString(),
                        append: link('/stores/return_lines/' + line.return_line_id)
                    });
                } add_cell(row);

                if (delete_permission && !complete && !closed) {
                    if (line._status === 'Pending') {
                        add_cell(row, {append: deleteBtn('/stores/issue_lines/' + line.line_id)});
                    } else add_cell(row);
                };
            });
        } else alert('Error: ' + response.error)
        hide_spinner('issues');
    });
    let query = ['issue_id=' + issue_id];
    XHR_send(XHR, 'issues', '/stores/get/issuelines?' + query.join('&'));
};