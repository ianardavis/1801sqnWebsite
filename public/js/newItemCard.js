var addWindow = null;
function addSize(callType) {
    if (addWindow === null || addWindow.closed) {
        addWindow = window.open("/stores/itemSearch?callType=" + callType,
                                "itemSearch",
                                "width=600,height=840,resizeable=no,location=no");
    } else addWindow.focus();
};

function addSize(item) {
    let serial_id  = item.serial_id || '',
        existingID = document.querySelector('#id-' + item.size_id + serial_id);
    if (typeof(existingID) === 'undefined' || existingID !== null) return 'Item/Size already added!'
    else {
        try {
            let selectedList = document.querySelector('#selectedItems');
            selectedList.appendChild(NewItemCard(item))
            return 'Item added'
        } catch (error) {
            return error.message
        };
    };
};

function NewItemCard (item) {
    let _div        = document.createElement('div'),
        _card       = document.createElement('div'),
        _header     = document.createElement('div'),
        _body       = document.createElement('div'),
        _title      = document.createElement('h5'),
        _subtitle   = document.createElement('p'),
        _delete     = document.createElement('a'),
        serial_id   = item.serial_id || '';
        card_id     = 'id-' + item.size_id + serial_id;

    _div.classList.add('col-12', 'col-sm-6', 'col-lg-4');
    _div.id = card_id;
    
    _card.classList.add('card', 'cardDarkText', 'm-3', 'text-left');
    
    _header.classList.add('card-header');

    _title.classList.add('card-title');
    _title.innerText = item.description;

    _subtitle.classList.add('card-subtitle');
    _subtitle.innerText = 'Size: ' + item.size;

    _delete.classList.add('float-right', 'btn', 'btn-sm', 'btn-danger');
    _delete.href = 'javascript:removeID("' + card_id + '")';
    _delete.innerHTML = '<i class="fas fa-trash-alt"></i>';
    
    _header.appendChild(_delete);
    _header.appendChild(_title);
    _header.appendChild(_subtitle);
    
    _body.classList.add('card-body');
    
    let size_id = document.createElement('input');
    size_id.type = 'hidden';
    size_id.name = 'selected[' + String(item.size_id) + '][size_id]';
    size_id.value = item.size_id;
    _body.appendChild(size_id);

    if (item.request_line_id) {
        let request_line_id = document.createElement('input');
        request_line_id.type = 'hidden';
        request_line_id.name = 'selected[' + String(item.size_id) + '][request_line_id]';
        request_line_id.value = item.request_line_id;
        _body.appendChild(request_line_id);
    };
    if (item.demand_line_id) {
        let demand_line_id = document.createElement('input');
        demand_line_id.type = 'hidden';
        demand_line_id.name = 'selected[' + String(item.size_id) + '][demand_line_id]';
        demand_line_id.value = item.demand_line_id;
        _body.appendChild(demand_line_id);
    };
    if (item.order_lines) {
        item.order_lines.forEach(order_line => {
            let order_line_id = document.createElement('input');
            order_line_id.type = 'hidden';
            order_line_id.name = 'selected[' + String(item.size_id) + '][order_lines][]';
            order_line_id.value = order_line;
            _body.appendChild(order_line_id);
        });
    };

    if (item.serials && item.serials.length > 0) {
        _body.appendChild(newRow('Serial', 
            newSelect(String(item.size_id), 'serial', '_serial', item)));
    } else {
        let qty       = document.createElement('input');
        qty.type = 'number';
        qty.name = 'selected[' + String(item.size_id) + '][qty]';
        qty.classList.add('form-control','form-control-sm');
        qty.value = item.qty;
        _body.appendChild(newRow('Quantity', qty));
    };

    if (item.nsns) {
        _body.appendChild(newRow('NSN', 
            newSelect(String(item.size_id), 'nsn', '_nsn', item)));
    };
    if (item.stocks) {
        let stockSelect = document.createElement('select');
        stockSelect.name = 'selected[' + String(item.size_id) + '][stock_id]';
        stockSelect.classList.add('form-control','form-control-sm');
        item.stocks.forEach(stock => stockSelect.appendChild(newOption(stock.stock_id, stock._location + ' (Stock: ' + stock.qty + ')')));
        if (item.stock_id) stockSelect.value = item.stock_id;
        
        _body.appendChild(newRow('Locations', stockSelect));
    };
    _card.appendChild(_header);
    _card.appendChild(_body);
    _div.appendChild(_card);
    return _div;
};

function newSelect (card_id, field_name, field_display, item) {
    let _select = document.createElement('select');
    _select.name = 'selected[' + String(item.size_id) + '][' + field_name + '_id]';
    _select.classList.add('form-control','form-control-sm');
    item[field_name + 's'].forEach(_data => _select.appendChild(newOption(_data[field_name + '_id'], _data[field_display])));
    if (item[field_name + '_id']) _select.value = item[field_name + '_id'];
    return _select;
};
function newRow (label, _input) {
    let _row       = document.createElement('div'),
        _label_div = document.createElement('div'),
        _label     = document.createElement('label'),
        _text_div  = document.createElement('div');
    _text_div.classList.add('col-8');
    _text_div.appendChild(_input);
    _row.classList.add('row');
    _label_div.classList.add('col-4');
    _label.classList.add('col-form-label');
    _label.innerText = label;
    _label_div.appendChild(_label);
    _row.appendChild(_label_div);
    _row.appendChild(_text_div);
    return _row;
};
function newOption (value, innerText) {
    let option = document.createElement('option');
    option.value = value;
    option.innerText = innerText;
    return option;
};