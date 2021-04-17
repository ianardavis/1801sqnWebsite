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
    remove_attribute({id: 'btn_size_add', attribute: 'disabled'});
    addFormListener(
        'size_add',
        'POST',
        '/sizes',
        {onComplete: [
            getSizes,
            function () {set_value({id: 'size', value: ''})}
        ]}
    );
    addClickListener('reload_suppliers', getSuppliers);
});