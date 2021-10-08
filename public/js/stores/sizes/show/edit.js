function viewSizeEdit() {
    get({
        table: 'size',
        query: [`size_id=${path[2]}`]
    })
    .then(function ([size, options]) {
        getSuppliers(size.supplier_id);
        set_value({id: 'sel_issueable', value: (size.issueable   ? '1' : '0')});
        set_value({id: 'sel_orderable', value: (size.orderable   ? '1' : '0')});
        set_value({id: 'sel_serials',   value: (size.has_serials ? '1' : '0')});
        set_value({id: 'sel_nsns',      value: (size.has_nsns    ? '1' : '0')});
        set_value({id: 'size1_edit',    value: size.size1});
        set_value({id: 'size2_edit',    value: size.size2});
        set_value({id: 'size3_edit',    value: size.size3});
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
                getSize,
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
    addListener('reload_suppliers', function () {getSuppliers()});
});