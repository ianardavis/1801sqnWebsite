function NewItemCard (item) {
    let _div        = document.createElement('div'),
        _card       = document.createElement('div'),
        _header     = document.createElement('div'),
        _body       = document.createElement('div'),
        _title      = document.createElement('h5'),
        _subtitle   = document.createElement('p'),
        _delete     = document.createElement('a'),
        qty         = document.createElement('input');

    _div.classList.add('col-12', 'col-sm-6', 'col-lg-4', 'col-xl-3');
    _div.id = 'id-' + item.itemsize_id;
    
    _card.classList.add('card', 'cardDarkText', 'm-3', 'text-left');

    if (item.itemsize_id) {
        let itemsize_id = document.createElement('input');
        itemsize_id.type  = 'hidden';
        itemsize_id.name  = 'selected[' + item.itemsize_id + '][itemsize_id]';
        itemsize_id.value = item.itemsize_id;
        _card.appendChild(itemsize_id);
    };
    if (item.stock_id) {
        let stock_id = document.createElement('input');
        stock_id.type  = 'hidden';
        stock_id.name  = 'selected[' + item.stock_id + '][stock_id]';
        stock_id.value = item.stock_id;
        _card.appendChild(stock_id);
    };
    
    _header.classList.add('card-header');

    _title.classList.add('card-title');
    _title.innerText = item.description;

    _subtitle.classList.add('card-subtitle');
    _subtitle.innerText = 'Size: ' + item.size;

    _delete.classList.add('float-right', 'btn', 'btn-sm', 'btn-danger');
    _delete.href = 'javascript:removeID("id-' + item.itemsize_id + '")';
    _delete.innerHTML = '<i class="fas fa-trash-alt"></i>';
    
    _header.appendChild(_delete);
    _header.appendChild(_title);
    _header.appendChild(_subtitle);
    
    _body.classList.add('card-body');
    
    qty.type = 'number';
    qty.name = 'selected[' + item.itemsize_id + '][qty]';
    qty.classList.add('form-control','form-control-sm');
    qty.value = item.qty;
    _body.appendChild(qty);

    if (item.nsns) {
        let newNSNs = document.createElement('select');
        newNSNs.name = 'selected[' + item.itemsize_id + '][nsn_id]';
        newNSNs.classList.add('form-control','form-control-sm');
        item.nsns.forEach(nsn => newNSNs.appendChild(newOption(nsn.nsn_id, nsn._nsn)));
        if (item.nsn_id) newNSNs.value = item.nsn_id;
        _body.appendChild(newNSNs);
    };
    if (item.stocks) {
        let newStocks = document.createElement('select');
        newStocks.name = 'selected[' + item.itemsize_id + '][stock_id]';
        newStocks.classList.add('form-control','form-control-sm');
        item.stocks.forEach(stock => newStocks.appendChild(newOption(stock.stock_id, stock._location)));
        if (item.stock_id) newStocks.value = item.stock_id;
        _body.appendChild(newStocks);
    };

    _card.appendChild(_header);
    _card.appendChild(_body);
    _div.appendChild(_card);

    return _div;
};

function newOption (value, innerText) {
    let option = document.createElement('option');
    option.value = value;
    option.innerText = innerText;
    return option;
};