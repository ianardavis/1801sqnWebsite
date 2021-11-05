function getSize() {
    get({
        table: 'size',
        query: [`size_id=${path[2]}`]
    })
    .then(function ([size, options]) {
        set_breadcrumb({text: `${print_size_text(size.item)}: ${print_size(size)}`});
        set_innerText({id: 'issueable',     text: yesno(size.issueable)});
        set_innerText({id: 'orderable',     text: yesno(size.orderable)});
        set_innerText({id: 'has_serials',   text: yesno(size.has_serials)});
        set_innerText({id: 'has_nsns',      text: yesno(size.has_nsns)});
        set_innerText({id: 'supplier',      text: (size.supplier ? size.supplier.name : '')});
        set_attribute({id: 'supplier_link', attribute: 'href', value: (size.supplier ? `/suppliers/${size.supplier_id}` : '')});
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
        set_innerText({id: 'item', text: size.item.description});
        set_href(     {id: 'item', value: `/items/${size.item_id}`});
        document.querySelectorAll('.size_id').forEach(e => e.setAttribute('value', size.size_id));
    })
    .catch(err => window.location.replace('/items'));
};
addReloadListener(getSize);