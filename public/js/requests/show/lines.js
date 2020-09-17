showLines = (lines, options) => {
    let table_body = document.querySelector('#linesTable'),
        line_count = document.querySelector('#line_count');
    if (lines) line_count.innerText = lines.length || '0';
    table_body.innerHTML = '';
    lines.forEach(line => {
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
        if (line.request._complete) {
            if (line._status === 'Approved') {
                add_cell(row, {
                    text: line._status + ' - ' + line._action,
                    append: new Link({
                        href: `/stores/${String(line._action).toLowerCase()}_lines/${line._id}`,
                        small: true,
                        float: true
                    }).link
                });
                add_cell(row, {text: new Date(line._date).toDateString()});
                add_cell(row, {text: line.user.rank._rank + ' ' + line.user.full_name});
            } else if (line._status === 'Declined' || !options.permissions.edit) {
                add_cell(row, {text: line._status});
                if (line._date) add_cell(row, {text: new Date(line._date).toDateString()})
                else add_cell(row);
                if (line.user) add_cell(row, {text: line.user.rank._rank + ' ' + line.user.full_name})
                else add_cell(row);
            } else {
                let _status = _select({
                        name: 'actions[line_id' + line.line_id + '][_status]',
                        id:   'sel_' + line.line_id
                    });
                _status.appendChild(_option({value: '', text: 'Open'}));
                _status.appendChild(_option({value: 'Approved', text: 'Approved'}));
                _status.appendChild(_option({value: 'Declined', text: 'Declined'}));
                _status.addEventListener("change", function (event) {
                    if (this.value === 'Approved') showActions(line.size_id, line.line_id)
                    else {
                        let _cell  = document.querySelector('#action_' + line.line_id),
                            _cell2 = document.querySelector('#details_' + line.line_id);
                        _cell.innerHTML  = '';
                        _cell2.innerHTML = '';
                    }
                });
                add_cell(row, {append: _status});
                add_cell(row, {id: 'action_' + line.line_id});
                add_cell(row, {id: 'details_' + line.line_id});
            };
        } else {
            add_cell(row, {text: line._status});
            if (options.permissions.delete) {
                let cellDelete = row.insertCell(-1);
                cellDelete.appendChild(deleteBtn('/stores/request_lines/' + line.line_id));
            };
        };
    });
    hide_spinner('requests');
};
showActions = (size_id, line_id) => {
    let _cell = document.querySelector('#action_' + line_id);
    _cell.innerHTML = _spinner('line_' + line_id);
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", function(event) {
        let response = JSON.parse(event.target.responseText);
        if (response.result) {
            let _action = document.createElement('select'),
                _order  = document.createElement('option'),
                _issue  = document.createElement('option'),
                _blank  = document.createElement('option');
            _action.classList.add('form-control', 'form-control-sm');
            _action.name     = 'actions[line_id' + line_id + '][_action]';
            _action.required = true;

            _blank.value     = '';
            _blank.innerText = '... Select Action';
            _action.appendChild(_blank);
            if (response.size._orderable) {
                _order.value     = 'Order';
                _order.innerText = 'Order';
                _action.appendChild(_order);
            };

            if (response.size._issueable) {
                _issue.value     = 'Issue';
                _issue.innerText = 'Issue';
                _action.appendChild(_issue);
            };

            _cell.innerHTML = '';
            _action.addEventListener("change", function (event) {
                if (this.value === 'Issue') getStock(size_id, line_id)
                else {
                    let _cell = document.querySelector('#details_' + line_id);
                    _cell.innerHTML = '';
                };
            });
            _cell.appendChild(_action);
        } else {
            _cell.innerHTML = '';
            alert('Error: ' + response.error);
        };
    });
    XHR.addEventListener("error", function(event) {
        _cell.innerHTML = '';
        alert('Oops! Something went wrong.');
    });
    XHR.open('GET', '/stores/get/sizes?size_id=' + size_id);
    XHR.send();
};
getStock = (size_id, line_id) => {
    let _cell = document.querySelector('#details_' + line_id);
    _cell.innerHTML = _spinner('line_' + line_id);
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", function(event) {
        let response = JSON.parse(event.target.responseText);
        if (response.result) {
            let _locations = document.createElement('select'),
                _blank  = document.createElement('option');
            _locations.classList.add('form-control', 'form-control-sm');
            _locations.name     = 'actions[line_id' + line_id + '][stock_id]';
            _locations.required = true;
            _blank.value     = '';
            _blank.innerText = '... Select Location';
            _locations.appendChild(_blank);
            response.size.stocks.forEach(stock => {
                let _location = document.createElement('option');
                _location.value     = stock.stock_id;
                _location.innerText = stock.location._location + ', Qty: ' + stock._qty;
                _locations.appendChild(_location);
            });
            _cell.innerHTML = '';
            _cell.appendChild(_locations);
            if (response.size._nsns) {
                let _nsns = document.createElement('select'),
                    _blank_nsn  = document.createElement('option');
                _nsns.classList.add('form-control', 'form-control-sm');
                _nsns.name     = 'actions[line_id' + line_id + '][nsn_id]';
                _nsns.required = true;
                _blank_nsn.value     = '';
                _blank_nsn.innerText = '... Select NSN';
                _nsns.appendChild(_blank_nsn);
                response.size.nsns.forEach(nsn => {
                    let _nsn = document.createElement('option');
                    _nsn.value     = nsn.nsn_id;
                    _nsn.innerText = nsn._nsn;
                    _nsns.appendChild(_nsn);
                });
                _cell.appendChild(_nsns);
            };
            if (response.size._serials) {
                let _serials = document.createElement('select'),
                    _blank_serial  = document.createElement('option');
                _serials.classList.add('form-control', 'form-control-sm');
                _serials.name     = 'actions[line_id' + line_id + '][serial_id]';
                _serials.required = true;
                _blank_serial.value     = '';
                _blank_serial.innerText = '... Select Serial';
                _serials.appendChild(_blank_serial);
                response.size.serials.forEach(serial => {
                    let _serial = document.createElement('option');
                    _serial.value     = serial.serial_id;
                    _serial.innerText = serial._serial;
                    _serials.appendChild(_serial);
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
    XHR.open('GET', '/stores/get/sizes?size_id=' + size_id);
    XHR.send();
};
getNSNs = (stock_id, size_id, line_id) => {
    let _cell = document.querySelector('#details_' + line_id);
    _cell.innerHTML = _spinner('line_' + line_id);
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", function(event) {
        let response = JSON.parse(event.target.responseText);
        if (response.result) {
            let _select = document.createElement('select'),
                _option = document.createElement('option');
            _select.classList.add('form-control', 'form-control-sm');
            _select.name      = 'actions[line_id' + line_id + ']';
            _select.required  = response.result.required;
            _option.value     = '';
            _option.innerText = '... Select NSN';
            _select.appendChild(_option);
            response.nsns.forEach(nsn => {
                let _location = document.createElement('option');
                _location.value     = '{"action":"Issue","stock_id":' + stock_id + ',"nsn_id":' + nsn.nsn_id + '}';
                _location.innerText = nsn._nsn;
                _select.appendChild(_location);
            });
            _cell.innerHTML = '';
            _cell.appendChild(_select);
        } else {
            _cell.innerHTML = '';
            alert('Error: ' + response.error);
        };
    });
    XHR.addEventListener("error", function(event) {
        _cell.innerHTML = '';
        alert('Oops! Something went wrong.');
    });
    XHR.open('GET', '/stores/get/nsns?size_id=' + size_id);
    XHR.send();
};
getSerials = (stock_id, size_id, line_id) => {
    let _cell = document.querySelector('#details_' + line_id);
    _cell.innerHTML = _spinner('line_' + line_id);
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", function(event) {
        let response = JSON.parse(event.target.responseText);
        if (response.result) {
            let _select = document.createElement('select'),
                _option = document.createElement('option');
            _select.classList.add('form-control', 'form-control-sm');
            _select.name      = 'actions[line_id' + line.line_id + '][]';
            _select.required  = response.result.required;
            _option.value     = '';
            _option.innerText = '... Select NSN';
            _select.appendChild(_option);
            response.nsns.forEach(nsn => {
                let _location = document.createElement('option');
                _location.value     = '{"action":"Issue","stock_id":' + stock_id + ',"nsn_id":' + nsn.nsn_id + '}';
                _location.innerText = nsn._nsn;
                _select.appendChild(_location);
            });
            _cell.innerHTML = '';
            _cell.appendChild(_select);
        } else {
            _cell.innerHTML = '';
            alert('Error: ' + response.error);
        };
    });
    XHR.addEventListener("error", function(event) {
        _cell.innerHTML = '';
        alert('Oops! Something went wrong.');
    });
    XHR.open('GET', '/stores/get/nsns?size_id=' + size_id);
    XHR.send();
};