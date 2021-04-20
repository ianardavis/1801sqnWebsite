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
        set_value({id: 'size_edit',     value: size.size});
    });
};
function getSuppliers(selected = null) {
    listSuppliers({
        blank:    true,
        id_only:  true,
        select:   'suppliers',
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
                function () {$('#mdl_size_edit').modal('hide')}
            ]
        }
    );
    addFormListener(
        'nsn_default',
        'PUT',
        `/sizes/${path[2]}/default_nsn`,
        {onComplete: getNSNs}
    );
    $('#mdl_size_edit').on('show.bs.modal', viewSizeEdit);
    document.querySelector('#reload_suppliers').addEventListener('click', function () {getSuppliers()});
});