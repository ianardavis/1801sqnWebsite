showLines = (lines, options) => {
    let table_body = document.querySelector('#linesTable');
    if (lines) document.querySelector('#line_count').innerText = lines.length || '0';
    table_body.innerHTML = '';
    lines.forEach(line => {
        try {
            let row = table_body.insertRow(-1);
            add_cell(row, {
                text: line.size.item._description,
                append: new Link({href: `/stores/items/${line.size.item_id}`, small: true, float: true}).link
            });
            add_cell(row, {
                text: line.size._size,
                append: new Link({href: `/stores/sizes/${line.size_id}`, small: true, float: true}).link
            });
            add_cell(row, {text: line._qty});
            if (line.request._status === 0) { //If cancelled
                //Maybe some code??
            } else if (line.request._status === 1) { //If draft
                if (options.permissions.delete) {
                    row.insertCell(-1).appendChild(new DeleteButton({path: `/stores/request_lines/${line.line_id}`, small: true}).form);
                };            
            } else if (line.request._status === 2) { //If open
                if (line._status === 0) {
                    if (options.permissions.line_edit) {
                        let _status = new Select({
                            name: `actions[line_id${line.line_id}][_status]`,
                            id:   `sel_${line.line_id}`,
                            options: [
                                {value: '0', text: 'Open'},
                                {value: '1', text: 'Approved'},
                                {value: '2', text: 'Declined'}
                            ]
                        }).select;
                        _status.addEventListener("change", function () {
                            if (this.value === '1') showActions(line.size_id, line.line_id)
                            else {
                                document.querySelector('#action_' + line.line_id).innerHTML  = '';
                                document.querySelector('#details_' + line.line_id).innerHTML = '';
                            };
                        });
                        add_cell(row, {append: _status});
                        add_cell(row, {id: `action_${line.line_id}`});
                        add_cell(row, {id: `details_${line.line_id}`});
                    } else {
                        add_cell(row, {text: 'Pending'});
                        add_cell(row);
                        add_cell(row);
                    };
                } else if (line._status === 1) {
                    add_cell(row, {
                        text: 'Approved - ' + line._action,
                        append: new Link({
                            href: `/stores/${String(line._action).toLowerCase()}_lines/${line._id}`,
                            small: true,
                            float: true
                        }).link
                    });
                    add_user_date(line, row);
                } else if (line._status === 2) {
                    add_cell(row, {text: 'Declined'});
                    add_user_date(line, row);
                };
            } else if (line.request._status === 3) { //If closed
                if (line._status === 0) add_cell(row, {text: 'Pending'})
                else if (line._status === 1) {
                    add_cell(row, {
                        text: `Approved - ${line._action}`,
                        append: new Link({
                            href: `/stores/${String(line._action).toLowerCase()}_lines/${line._id}`,
                            small: true,
                            float: true
                        }).link
                    })
                } else if (line._status === 2) add_cell(row, {text: 'Declined'});
                add_user_date(line, row);
            };
        } catch (error) {
            console.log(`Error loading line ${line.line_id}: ${error}`)
        };
    });
    hide_spinner('requests');
};
add_user_date = (line, row) => {
    if (line._date) add_cell(row, {text: new Date(line._date).toDateString(), sort: new Date(line._date).getTime()})
    else add_cell(row);
    if (line.user) add_cell(row, {text: line.user.rank._rank + ' ' + line.user.full_name})
    else add_cell(row);
};
add_spinner = (cell, options = null) => cell.appendChild(new Spinner(options).spinner);
remove_spinner = id => {
    let spinner = document.querySelector(`#spn_${id}`);
    if (spinner) spinner.remove();
};
showActions = (size_id, line_id) => {
    let _cell = document.querySelector(`#action_${line_id}`);
    _cell.innerHTML = '';
    add_spinner(_cell, {id: line_id});
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText);
        if (response.result) {
            let options = [{value: '', text: '... Select Action'}];
            if (response.sizes[0]._orderable) options.push({value: 'Order', text: 'Order'});
            if (response.sizes[0]._issueable) options.push({value: 'Issue', text: 'Issue'});
            let _action = new Select({
                small: true,
                name: `actions[line_id${line_id}][_action]`,
                required: true,
                options: options
            }).select;
            _action.addEventListener("change",  function () {
                if (this.value === 'Issue') {
                    getStock(size_id, line_id);
                    if (response.sizes[0]._nsns) getNSNs(size_id, line_id, response.sizes[0].nsn_id);
                    if (response.sizes[0]._serials) getSerials(size_id, line_id);
                } else document.querySelector(`#details_${line_id}`).innerHTML = '';
            });
            _cell.appendChild(_action);
        } else {
            alert(`Error: ${response.error}`);
        };
        remove_spinner(line_id);
    });
    XHR.addEventListener("error", () => {
        remove_spinner(line_id);
        alert('Oops! Something went wrong.');
    });
    XHR.open('GET', `/stores/get/sizes?size_id=${size_id}`);
    XHR.send();
};
getStock = (size_id, line_id) => {
    let _cell = document.querySelector(`#details_${line_id}`);
    _cell.innerHTML = '';
    add_spinner(_cell, {id: `stocks_${line_id}`});
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText);
        if (response.result) {
            if (response.stock) {
                let locations = [{value: '', text: '... Select Location'}];
                response.stock.forEach(e => locations.push({value: e.stock_id,text: `${e.location._location}, Qty: ${e._qty}`}));
                let _locations = new Select({
                    small: true,
                    name: `actions[line_id${line_id}][stock_id]`,
                    required: true,
                    options: locations
                }).select;
                _cell.appendChild(_locations);
            } else {
                alert(`Error: no matching stock found`);
            };
        } else {
            alert(`Error: ${response.error}`);
        };
        remove_spinner(`stocks_${line_id}`);
    });
    XHR.addEventListener("error", () => {
        remove_spinner(`stocks_${line_id}`);
        alert('Oops! Something went wrong.');
    });
    XHR.open('GET', `/stores/get/stock?size_id=${size_id}`);
    XHR.send();
};
getNSNs = (size_id, line_id, nsn_id = null) => {
    let _cell = document.querySelector(`#details_${line_id}`);
    _cell.innerHTML = '';
    add_spinner(_cell, {id: `nsns_${line_id}`});
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText);
        if (response.result) {
            let nsn_options = [{value: '', text: '... Select NSN'}];
            response.nsns.forEach(e => nsn_options.push({
                value: e.nsn_id,
                text: `${String(e.group._code).padStart(2, '0')}${String(e.classification._code).padStart(2, '0')}-${String(e.country._code).padStart(2, '0')}-${e._item_number}`,
                selected: (e.nsn_id === nsn_id)
            }));
            let _nsns = new Select({
                small: true,
                name: `actions[line_id${line_id}][nsn_id]`,
                required: response.result.required,
                options: nsn_options
            }).select;
            _cell.insertBefore(_nsns, document.querySelector(`#spn_nsns_${line_id}`));
        } else {
            alert(`Error: ${response.error}`);
        };
        remove_spinner(`nsns_${line_id}`);
    });
    XHR.addEventListener("error", () => {
        remove_spinner(`nsns_${line_id}`);
        alert('Oops! Something went wrong.');
    });
    XHR.open('GET', `/stores/get/nsns?size_id=${size_id}`);
    XHR.send();
};
getSerials = (size_id, line_id) => {
    let _cell = document.querySelector(`#details_${line_id}`);
    _cell.innerHTML = '';
    add_spinner(_cell, {id: `serials_${line_id}`});
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText);
        if (response.result) {
            let serials = [{value: '', text:  '... Select Serial #'}];
            response.serials.forEach(e => serials.push({value: e.serial_id, text: e._serial}));
            let _serials = new Select({
                small: true,
                name: `actions[line_id${line_id}][serial_id]`,
                required: response.result.required,
                options: serials
            }).select;
            _cell.insertBefore(_serials, document.querySelector(`#spn_serials_${line_id}`));
        } else {
            alert(`Error: ${response.error}`);
        };
        remove_spinner(`serials_${line_id}`);
    });
    XHR.addEventListener("error", () => {
        remove_spinner(`serials_${line_id}`);
        alert('Oops! Something went wrong.');
    });
    XHR.open('GET', `/stores/get/serials?size_id=${size_id}`);
    XHR.send();
};