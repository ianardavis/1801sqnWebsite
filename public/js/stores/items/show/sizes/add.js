function reset_add_size() {
    ['issueable', 'orderable', 'has_nsns', 'has_serials'].forEach(e => setValue(`size_${e}`, '0'));
    ['size1', 'size2', 'size3'].forEach(e => setValue(`size_${e}`));
    get_suppliers();
};
function get_suppliers() {
    if (typeof listSuppliers === 'function') {
        listSuppliers({
            select:     'size_supplier', 
            blank:      true,
            blank_text: 'None',
            id_only:    true
        });
    };
};
window.addEventListener('load', function () {
    modalOnShow('size_add', reset_add_size);
    enableButton('size_add');
    addFormListener(
        'size_add',
        'POST',
        '/sizes',
        {onComplete: [
            get_sizes,
            function () {['size1', 'size2', 'size3'].forEach(e => setValue(`size_${e}`));}
        ]}
    );
    add_listener('reload_suppliers', get_suppliers);
});