function getDemandLines(demand_id, complete, delete_permission) {
    show_spinner('demands');
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
        } else alert('Error: ' + response.error);
        hide_spinner('demands');
        spn_demands.style.display = 'none';
    });
    let sel_status = document.querySelector('#sel_status'),
        query      = ['demand_id=' + demand_id];
    if (sel_status.value !== 'All') query.push('_status=' + sel_status.value);
    XHR_send(XHR, 'demands', '/stores/get/demandlines?' + query.join('&'));
};