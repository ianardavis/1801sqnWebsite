showLines = (lines, options) => {
    let table_body = document.querySelector('#orderTable');
    if (lines) document.querySelector('#line_count').innerText = lines.length || '0';
    table_body.innerHTML = '';
    lines.forEach(line => {
        try {
            let row   = table_body.insertRow(-1);
            add_cell(row, {text: line.line_id});
            add_cell(row, {
                text: line.size.item._description,
                append: new Link({
                    href: `/stores/items/${line.size.item_id}`,
                    small: true,
                    float: true
                }).link
            });
            add_cell(row, {
                text: line.size._size,
                append: new Link({
                    href: `/stores/sizes/${line.size_id}`,
                    small: true,
                    float: true
                }).link
            });
            add_cell(row, {text: line._qty});
            let statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Demanded', '3': 'Received', '4': 'Complete'};
            if (line.order._status === 0) { //if order is cancelled
                //Some code maybe?
            } else if (line.order._status === 1) { //if order is draft
                if (options.permissions.delete) {
                    add_cell(row, {
                        append: new DeleteButton({
                            path: `/stores/order_lines/${line.line_id}`,
                            small: true
                        }).form
                    })
                };
            } else if (line.order._status === 2) { //if order is open
                if (!options.permissions.edit || line._status === 0 || line._status === 4) { //if line is cancelled, complete or not allowed to edit, just show status
                    add_cell(row, {text: statuses[line._status] || 'Unknown'});
                } else { // if allowed to edit, add select and add event listener
                    add_cell(row, {
                        append: new Select({
                            name: `actions[line_id${line.line_id}][_status]`,
                            id: `sel_${line.line_id}`,
                            options: [
                                {value: '',  text: 'Select Action', selected: true},
                                {value: '0', text: 'Cancel'}
                            ]
                        }).select
                    });
                    let select = document.querySelector(`#sel_${line.line_id}`);
                    if (select) {
                        select.addEventListener("change", function (event) {
                            let receive_cell = document.querySelector(`#receive_${line.line_id}`);
                            receive_cell.innerHTML = '';
                            let issue_cell = document.querySelector(`#issue_${line.line_id}`);
                            issue_cell.innerHTML = '';
                            if (this.value === '3') {
                                if (line.size._serials) {
                                    enterSerial(line.line_id);
                                } else {
                                    getStock(line.size_id, line.line_id, 'receive');
                                };
                            } else if (line.order.ordered_for !== -1 && this.value === '4') {
                                getStock(line.size_id, line.line_id, 'issue');
                                if (line.size._serials) getSerials(line.size_id, line.line_id);
                                if (line.size._nsns)    getNSNs(line.size_id, line.line_id, 'issue', line.size.nsn_id);
                            };
                        });
                    };
                };
                if (line.demand_id) { // if demanded
                    if (line.demand && line.demand._date) add_cell(row, {text: new Date(line.demand._date).toLocaleDateString()})
                    else add_cell(row, {text: 'Unknown'});
                } else {
                    let select = document.querySelector(`#sel_${line.line_id}`);
                    if (select) select.appendChild(new Option({value: '2', text: 'Demand'}).option);
                    add_cell(row);
                };
                if (line.receipt_id) { // if received
                    if (line.receipt && line.receipt._date) add_cell(row, {text: new Date(line.receipt._date).toLocaleDateString()})
                    else add_cell(row, {text: 'Unknown'});
                } else {
                    let select = document.querySelector(`#sel_${line.line_id}`);
                    if (select) {
                        let _value = '3';
                        if (line.order.ordered_for === -1) _value = '4';
                        select.appendChild(new Option({value: _value, text: 'Receive'}).option);
                    };
                    add_cell(row, {id: `receive_${line.line_id}`});
                };
                if (line.order.ordered_for !== -1) { //if not an order for backing stock
                    if (line.issue_id) { // if issued
                        if (line.issue && line.issue._date) add_cell(row, {text: new Date(line.issue._date).toLocaleDateString()})
                        else add_cell(row, {text: 'Unknown'});
                    } else {
                        let select = document.querySelector(`#sel_${line.line_id}`);
                        if (select) select.appendChild(new Option({value: '4', text: 'Issue'}).option);
                        add_cell(row, {id: `issue_${line.line_id}`});
                    };
                };
            } else if (line.order._status === 3) { //if order is complete
                add_cell(row, {text: statuses[line._status] || 'Unknown'});
                if (line.demand_id && line.demand_id !== '') {
                    if (line.demand && line.demand._date) {
                        add_cell(row, {
                            text: new Date(line.demand._date).toDateString(),
                            append: new Link({
                                href: `/stores/demand_lines/${line.demand_id}`,
                                small: true,
                                float: true
                            })
                        })
                    } else add_cell(row, {text: 'Unknown'});
                } else add_cell(row);
                if (line.receipt_id && line.receipt_id !== '') {
                    if (line.receipt && line.receipt._date) {
                        add_cell(row, {
                            text: new Date(line.receipt._date).toDateString(),
                            append: new Link({
                                href: `/stores/receipt_lines/${line.receipt_id}`,
                                small: true,
                                float: true
                            })
                        })
                    } else add_cell(row, {text: 'Unknown'});
                } else add_cell(row);
                if (line.order.ordered_for !== -1) {
                    if (line.issue_id && line.issue_id !== '') {
                        if (line.issue && line.issue._date) {
                            add_cell(row, {
                                text: new Date(line.issue._date).toDateString(),
                                append: new Link({
                                    href: `/stores/issue_lines/${line.issue_id}`,
                                    small: true,
                                    float: true
                                })
                            })
                        } else add_cell(row, {text: 'Unknown'});
                    } else add_cell(row);
                };
            };
        } catch (error) {
            console.log(`Error loading line ${line.line_id}: ${error}`)
        };
    });
};
enterSerial = line_id => {
    let _cell = document.querySelector(`#receive_${line_id}`);
    _cell.appendChild(
        new Input({
            name: `actions[line_id${line_id}][_serial]`,
            small: true,
            placeholder: 'Serial #',
            required: true,
            maxlength: '45'
        }).input
    );
    _cell.appendChild(
        new Input({
            name: `actions[line_id${line_id}][_location]`,
            small: true,
            placeholder: 'Location',
            required: true,
            maxlength: '20'
        }).input
    );
};