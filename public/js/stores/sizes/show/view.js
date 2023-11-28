function get_size() {
    function disable_all_buttons() {
        disableButton('delete');
        disableButton('size_edit');//
        disableButton('detail_add');
        disableButton('nsn_add');//
        disableButton('serial_add');//
        disableButton('stock_add');//
        disableButton('receipt_add');
        disableButton('order_add');//
        disableButton('issue_add');//
    };
    function display_details([size, options]) {
        setBreadcrumb(`${printSizeText(size.item)}: ${printSize(size)}`);
        setInnerText('issueable',   yesno(size.issueable));
        setInnerText('orderable',   yesno(size.orderable));
        setInnerText('has_serials', yesno(size.has_serials));
        setInnerText('has_nsns',    yesno(size.has_nsns));
        setInnerText('supplier',    (size.supplier ? size.supplier.name : ''));
        setInnerText('item',        size.item.description);
        return size;
    };
    function set_links(size) {
        setHREF('supplier_link', (size.supplier ? `/suppliers/${size.supplier_id}` : ''));
        setHREF('item', `/items/${size.item_id}`);
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
    .catch(err => redirectOnError(err, '/items'));
};
window.addEventListener('load', function () {
    addListener('reload', get_size);
    get_size();
});