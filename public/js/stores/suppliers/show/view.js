function getSupplier() {
    get({
        table: 'supplier',
        where: {supplier_id: path[2]}
    })
    .then(function ([supplier, options]) {
        set_breadcrumb(supplier.name);
        set_innerText('supplier_name',      supplier.name);
        set_innerText('supplier_account',   (supplier.account ? print_account(supplier.account) : ''));
        set_innerText('supplier_is_stores', yesno(supplier.is_stores));
        set_data('supplier_account_link', 'id', supplier.account_id);
        document.querySelectorAll('.supplier_id').forEach(e => e.value = supplier.supplier_id);
    })
    .catch(err => window.location.assign('/suppliers'));
};
addReloadListener(getSupplier);