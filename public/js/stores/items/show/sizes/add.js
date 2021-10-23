function resetAddSize() {
    ['issueable', 'orderable', 'has_nsns', 'has_serials'].forEach(e => set_value({id: `size_${e}`, value: '0'}));
    ['size1', 'size2', 'size3'].forEach(e => set_value({id: `size_${e}`, value: ''}));
    getSuppliers();
};
function getSuppliers() {
    if (typeof listSuppliers === 'function') {
        listSuppliers({
            select:     'size_supplier', 
            blank:      true,
            blank_text: 'None'
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
            function () {['size1', 'size2', 'size3'].forEach(e => set_value({id: `size_${e}`, value: ''}));}
        ]}
    );
    addListener('reload_suppliers', getSuppliers);
});