function NewItemCard (item, id_field) {
    let _div        = document.createElement('div'),
        _card       = document.createElement('div'),
        _header     = document.createElement('div'),
        _body       = document.createElement('div'),
        _title      = document.createElement('h5'),
        _subtitle   = document.createElement('p'),
        _delete     = document.createElement('a'),
        serial_id   = item.serial_id || '';
        card_id     = 'id-' + item[id_field] + serial_id;

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
    
    if (item.request_line_id) {
        let request_line_id = document.createElement('input');
        request_line_id.type = 'hidden';
        request_line_id.name = 'selected[' + card_id + '][request_line_id]';
        request_line_id.value = item.request_line_id;
        _body.appendChild(request_line_id);
    };

    if (item.serials) {
        _body.appendChild(newRow('Serial', 
            newSelect(String(item[id_field]), 'serial', '_serial', item)));
    } else {
        let qty       = document.createElement('input');
        qty.type = 'number';
        qty.name = 'selected[' + String(item[id_field]) + '][qty]';
        qty.classList.add('form-control','form-control-sm');
        qty.value = item.qty;
        _body.appendChild(newRow('Quantity', qty));
    };

    if (item.nsns) {
        _body.appendChild(newRow('NSN', 
            newSelect(String(item[id_field]), 'nsn', '_nsn', item)));
    };
    if (item.stocks) {
        _body.appendChild(newRow('Location', 
            newSelect(String(item[id_field]), 'stock', '_location', item)));
    };
    _card.appendChild(_header);
    _card.appendChild(_body);
    _div.appendChild(_card);
    return _div;
};

function newSelect (card_id, field_name, field_display, item) {
    let _select = document.createElement('select');
    _select.name = 'selected[' + card_id + '][' + field_name + '_id]';
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