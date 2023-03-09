function resetAddSize() {
    ['issueable', 'orderable', 'has_nsns', 'has_serials'].forEach(e => set_value(`size_${e}`, '0'));
    ['size1', 'size2', 'size3'].forEach(e => set_value(`size_${e}`));
    getSuppliers();
};
function getSuppliers() {
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
    modalOnShow('size_add', resetAddSize);
    enable_button('size_add');
    addFormListener(
        'size_add',
        'POST',
        '/sizes',
        {onComplete: [
            getSizes,
            function () {['size1', 'size2', 'size3'].forEach(e => set_value(`size_${e}`));}
        ]}
    );
    add_listener('reload_suppliers', getSuppliers);
});