function viewSupplierEdit() {
    get({
        table:   'supplier',
        query:   [`supplier_id=${path[2]}`],
        spinner: 'supplier_edit'
    })
    .then(function ([supplier, options]) {
        set_value({id: 'supplier_name_edit',      value: supplier.name});
        set_value({id: 'supplier_is_stores_edit', value: (supplier.is_stores ? '1' : '0')});
        listAccounts({selected: supplier.account_id});
    });
};
window.addEventListener("load", function () {
    document.querySelector('#reload_accounts').addEventListener('click', listAccounts);
    enable_button('supplier_edit');
    modalOnShow('supplier_edit', viewSupplierEdit);
    addFormListener(
        'supplier_edit',
        'PUT',
        `/suppliers/${path[2]}`,
        {
            onComplete: [
                getSupplier,
                function () {modalHide('supplier_edit')}
            ]
        }
    );
});