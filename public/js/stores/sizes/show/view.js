function get_size() {
    function disable_all_buttons() {
        disable_button('delete');
        disable_button('size_edit');//
        disable_button('detail_add');
        disable_button('nsn_add');//
        disable_button('serial_add');//
        disable_button('stock_add');//
        disable_button('receipt_add');
        disable_button('order_add');//
        disable_button('issue_add');//
    };
    function display_details([size, options]) {
        set_breadcrumb(`${print_size_text(size.item)}: ${print_size(size)}`);
        set_innerText('issueable',   yesno(size.issueable));
        set_innerText('orderable',   yesno(size.orderable));
        set_innerText('has_serials', yesno(size.has_serials));
        set_innerText('has_nsns',    yesno(size.has_nsns));
        set_innerText('supplier',    (size.supplier ? size.supplier.name : ''));
        set_innerText('item',        size.item.description);
        return size;
    };
    function set_links(size) {
        set_href('supplier_link', (size.supplier ? `/suppliers/${size.supplier_id}` : ''));
        set_href('item', `/items/${size.item_id}`);
        return size;
    };
    function set_button_states(size) {
        if (typeof enable_edit_size  === 'function') enable_edit_size();
        if (typeof enable_add_detail === 'function') enable_add_detail();
        if (typeof enable_delete     === 'function') enable_delete();
        function set_elements(condition, class_name, func) {
            let elements = document.querySelectorAll(`.${class_name}`);
            if (condition) {
                if (typeof func === 'function') func();
                elements.forEach(e => e.classList.remove('hidden'));
    
            } else {
                elements.forEach(e => e.classList.add('hidden'));
    
            };
        };
        set_elements(size.has_nsns,  'has_nsns_element',   enable_add_nsn);
        set_elements(size.orderable, 'orderable_elements', enable_add_order);
        set_elements(size.issueable, 'issueable_elements', enable_add_issue);

        let  stock_elements = document.querySelectorAll('.stock_element');
        let serial_elements = document.querySelectorAll('.serial_element');
        if (size.has_serials) {
            if (typeof enable_add_serial === 'function') enable_add_serial();
            stock_elements .forEach(e => e.classList.add('hidden'));
            serial_elements.forEach(e => e.classList.remove('hidden'));

        } else {
            if (typeof enable_add_stock === 'function') enable_add_stock();
            stock_elements .forEach(e => e.classList.remove('hidden'));
            serial_elements.forEach(e => e.classList.add('hidden'));

        };
        return size;
    };

    disable_all_buttons();
    get({
        table: 'size',
        where: {size_id: path[2]}
    })
    .then(display_details)
    .then(set_links)
    .then(set_button_states)
    .then(size => {
        document.querySelectorAll('.size_id').forEach(e => e.setAttribute('value', size.size_id));
    })
    .catch(err => redirect_on_error(err, '/items'));
};
window.addEventListener('load', function () {
    add_listener('reload', get_size);
    get_size();
});