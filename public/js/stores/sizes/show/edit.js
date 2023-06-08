const enable_edit_size = enable_button('size_edit');
function viewSizeEdit() {
    get({
        table: 'size',
        where: {size_id: path[2]}
    })
    .then(function ([size, options]) {
        getSuppliers(size.supplier_id);
        set_value('sel_issueable', (size.issueable   ? '1' : '0'));
        set_value('sel_orderable', (size.orderable   ? '1' : '0'));
        set_value('sel_serials',   (size.has_serials ? '1' : '0'));
        set_value('sel_nsns',      (size.has_nsns    ? '1' : '0'));
        set_value('size1_edit',    size.size1);
        set_value('size2_edit',    size.size2);
        set_value('size3_edit',    size.size3);
    });
};
function getSuppliers(selected = null) {
    listSuppliers({
        blank:    true,
        id_only:  true,
        selected: selected
    });
};

window.addEventListener('load', function () {
    enable_button('size_edit');
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
    add_listener('reload_suppliers', function () {getSuppliers()});
});