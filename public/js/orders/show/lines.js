showLines = (lines, options) => {
    let table_body = document.querySelector('#orderTable'),
        line_count = document.querySelector('#line_count');
    if (lines) line_count.innerText = lines.length || '0';
    table_body.innerHTML = '';
    lines.forEach(line => {
        let row   = table_body.insertRow(-1);
        add_cell(row, {text: line.line_id});
        add_cell(row, {
            text: line.size.item._description,
            append: link('/stores/items/' + line.size.item_id)
        });
        add_cell(row, {
            text: line.size._size,
            append: link('/stores/sizes/' + line.size.size_id)
        });
        add_cell(row, {text: line._qty});

        let cell5 = row.insertCell(-1);
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
                    if (this.value === 'Receive' || this.value === 'Issue') getStock_select(line.size_id, line.line_id, this.value);
                });
                cell5.appendChild(select)
            } else {
                cell5.innerText = line._status;
            };
        } else {
            cell5.innerText = line._status;
        };
        if (delete_permission && !complete && !closed) {
            let cell10 = row.insertCell(-1);
            if (line._status === 'Pending') {
                cell10.appendChild(deleteBtn('/stores/order_lines/' + line.line_id));
            };
        };
    });
};