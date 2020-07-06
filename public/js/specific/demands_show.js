function getStock(size_id, line_id, action) {
    let _cell = document.querySelector('#stock' + line_id);
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
            _locations.appendChild(_option('', '... Select Location'));
            response.size.stocks.forEach(stock => {
                _locations.appendChild(_option(stock.stock_id, stock.location._location + ', Qty: ' + stock._qty));
            });
            _cell.innerHTML = '';
            _cell.appendChild(_locations);
            if (response.size._serials) {
                let _serials = _input({
                    name: 'actions[line_id' + line_id + '][_serial]',
                    placeholder: 'Enter Serial #'
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