const enable_edit_size = enableButton('size_edit');
function viewSizeEdit() {
    get({
        table: 'size',
        where: {size_id: path[2]}
    })
    .then(function ([size, options]) {
        get_suppliers(size.supplier_id);
        setValue('sel_issueable', (size.issueable   ? '1' : '0'));
        setValue('sel_orderable', (size.orderable   ? '1' : '0'));
        setValue('sel_serials',   (size.has_serials ? '1' : '0'));
        setValue('sel_nsns',      (size.has_nsns    ? '1' : '0'));
        setValue('size1_edit',    size.size1);
        setValue('size2_edit',    size.size2);
        setValue('size3_edit',    size.size3);
    });
};
function get_suppliers(selected = null) {
    listSuppliers({
        blank:    true,
        id_only:  true,
        selected: selected
    });
};

window.addEventListener('load', function () {
    enableButton('size_edit');
    addFormListener(
        'size_edit',
        'PUT',
        `/sizes/${path[2]}`,
        {
            onComplete: [
                get_size,
                function () {modalHide('size_edit')}
            ]
        }
    );
    addFormListener(
        'nsn_default',
        'PUT',
        `/sizes/${path[2]}/default_nsn`,
        {onComplete: getNSNs}
    );
    modalOnShow('size_edit', viewSizeEdit);
    addListener('reload_suppliers', get_suppliers);
});