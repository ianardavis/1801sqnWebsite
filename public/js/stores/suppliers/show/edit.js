function viewSupplierEdit() {
    get({
        table:   'supplier',
        where: {supplier_id: path[2]},
        spinner: 'supplier_edit'
    })
    .then(function ([supplier, options]) {
        set_value('supplier_name_edit',      supplier.name);
        set_value('supplier_is_stores_edit', (supplier.is_stores ? '1' : '0'));
        listAccounts({selected: supplier.account_id});
    });
};
window.addEventListener("load", function () {
    addListener('reload_accounts', listAccounts);
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