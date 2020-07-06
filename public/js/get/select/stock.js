getStock_select = (size_id, line_id, action) => {
    let _cell = document.querySelector('#' + action + line_id);
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
            _locations.appendChild(new Option({value: '', text: '... Select Location'}).option);
            response.size.stocks.forEach(stock => {
                _locations.appendChild(new Option({value: stock.stock_id, text: stock.location._location + ', Qty: ' + stock._qty}).option);
            });
            _cell.innerHTML = '';
            _cell.appendChild(_locations);
            if (response.size._nsns && action === 'Issue') {
                let _nsns = _select({
                    name: 'actions[line_id' + line_id + '][nsn_id]',
                    required: true
                });
                _nsns.required = true;
                _nsns.appendChild(new Option({value: '', text: '... Select NSN'}).option);
                response.size.nsns.forEach(nsn => {
                    _nsns.appendChild(new Option({value: nsn.nsn_id, text: nsn._nsn}).option);
                });
                _cell.appendChild(_nsns);
            };
            if (response.size._serials) {
                let _serials = null
                if (action === 'Receive') {
                    _serials = _input({
                        name: 'actions[line_id' + line_id + '][_serial]',
                        placeholder: 'Enter Serial #'
                    });
                } else if (action === 'Issue') {
                    _serials = _select({
                        name: 'actions[line_id' + line_id + '][serial_id]',
                        required: true
                    });
                    _serials.required = true;
                    _serials.appendChild(new Option({value: '', text: '... Select Serial'}).option);
                    response.size.serials.forEach(serial => {
                        _serials.appendChild(new Option({value: serial.serial_id, text: serial._serial}).option);
                    });
                };
                _cell.appendChild(_serials);
            };
            if (action === 'Issue') {
                let newDate = new Date(),
                    dd = String(newDate.getDate()).padStart(2, '0'),
                    MM = String(newDate.getMonth() + 1).padStart(2, '0'),
                    yyyy = newDate.getFullYear() + 7;
                _cell.appendChild(
                    _input({
                        name:        'actions[line_id' + line_id + '][_due_date]',
                        type:        'date',
                        placeholder: '... Select Due Date',
                        value:       yyyy + '-' + MM + '-' + dd
                    })
                )
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