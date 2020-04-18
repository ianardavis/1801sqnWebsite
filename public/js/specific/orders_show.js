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
                let row = table_body.insertRow(-1);
                let cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1),
                    cell6 = row.insertCell(-1),
                    cell7 = row.insertCell(-1);

                cell1.innerText = line.size.item._description;
                cell1.appendChild(link('/stores/items/' + line.size.item_id));
                
                cell2.innerText = line.size._size;
                cell2.appendChild(link('/stores/sizes/' + line.size.size_id));

                cell3.innerText = line._qty;
                cell4.innerText = line._status;

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

                if (edit_permission && complete && !closed) {
                    let cell8 = row.insertCell(-1);
                    if (line._status !== 'Cancelled' && line._status !== 'Received') {
                        cell8.appendChild(checkbox({id: line.line_id}));
                    };
                };
                if (delete_permission && !complete && !closed) {
                    let cell9 = row.insertCell(-1);
                    if (line._status === 'Open') {
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