function getSize() {
    get({
        table: 'size',
        query: [`"size_id":"${path[2]}"`]
    })
    .then(function ([size, options]) {
        set_breadcrumb(`${print_size_text(size.item)}: ${print_size(size)}`);
        set_innerText('issueable',   yesno(size.issueable));
        set_innerText('orderable',   yesno(size.orderable));
        set_innerText('has_serials', yesno(size.has_serials));
        set_innerText('has_nsns',    yesno(size.has_nsns));
        set_innerText('supplier',    (size.supplier ? size.supplier.name : ''));
        set_href('supplier_link', (size.supplier ? `/suppliers/${size.supplier_id}` : ''));
        let stock_elements  = document.querySelectorAll('.stock_element'),
            serial_elements = document.querySelectorAll('.serial_element');
        if (size.has_serials) {
            stock_elements .forEach(e => e.classList.add('hidden'));
            serial_elements.forEach(e => e.classList.remove('hidden'));
        } else {
            stock_elements .forEach(e => e.classList.remove('hidden'));
            serial_elements.forEach(e => e.classList.add('hidden'));
        };
        ['issueable', 'orderable', 'has_nsns'].forEach(e => {
            if (size[e]) document.querySelectorAll(`.${e}_element`).forEach(e => e.classList.remove('hidden'))
            else         document.querySelectorAll(`.${e}_element`).forEach(e => e.classList.add('hidden'));
        });
        set_innerText('item', size.item.description);
        set_href(     'item', `/items/${size.item_id}`);
        document.querySelectorAll('.size_id').forEach(e => e.setAttribute('value', size.size_id));
    })
    .catch(err => window.location.assign('/items'));
};
addReloadListener(getSize);