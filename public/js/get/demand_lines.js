getDemandLines = (demand_id, complete, delete_permission) => {
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
                add_cell(row, {text: line.line_id})
                add_cell(row, {
                    text: line.size.item._description,
                    append: link('/stores/items/' + line.size.item_id)
                });
                
                add_cell(row, {
                    text: line.size._size,
                    append: link('/stores/sizes/' + line.size.size_id)
                });

                add_cell(row, {text: line._qty});
                if (complete) {
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
                        add_cell(row, {append: select});
                        add_cell(row, {text: 'stock' + line.line_id});
                    } else {
                        add_cell(row, {text: line._status});
                        if (line.receipt_line) {
                            add_cell(row, {
                                text: new Date(line.receipt_line.receipt._date).toDateString(),
                                append: link('/stores/receipts/' + line.receipt_line.receipt_id)
                            })
                        };

                    };
                } else add_cell(row, {text: line._status});

                if (delete_permission && !complete) {
                    if (line._status === 'Pending') {
                        add_cell(row, {append: deleteBtn('/stores/demand_lines/' + line.line_id)})
                    } else add_cell(row)
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