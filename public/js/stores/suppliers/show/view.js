function getSupplier() {
    get({
        table: 'supplier',
        where: {supplier_id: path[2]}
    })
    .then(function ([supplier, options]) {
        setBreadcrumb(supplier.name);
        setInnerText('supplier_name',      supplier.name);
        setInnerText('supplier_account',   (supplier.account ? printAccount(supplier.account) : ''));
        setInnerText('supplier_is_stores', yesno(supplier.is_stores));
        setData('supplier_account_link', 'id', supplier.account_id);
        document.querySelectorAll('.supplier_id').forEach(e => e.value = supplier.supplier_id);
    })
    .catch(err => window.location.assign('/suppliers'));
};
window.addEventListener('load', function () {
    addListener('reload', getSupplier);
    getSupplier();
});