function resetAddSize() {
    ['issueable', 'orderable', 'has_nsns', 'has_serials'].forEach(e => set_value({id: e, value: '0'}));
    set_value({id: 'size', value: ''});
    getSuppliers();
};
function getSuppliers() {
    if (typeof listSuppliers === 'function') {
        listSuppliers({
            select: 'suppliers',
            blank: true,
            blank_text: 'None'
        });
    };
};
window.addEventListener('load', function () {
    $('#mdl_size_add').on('show.bs.modal', resetAddSize);
    enable_button('size_add');
    addFormListener(
        'size_add',
        'POST',
        '/sizes',
        {onComplete: [
            getSizes,
            function () {set_value({id: 'size', value: ''})}
        ]}
    );
    addListener('reload_suppliers', getSuppliers);
});