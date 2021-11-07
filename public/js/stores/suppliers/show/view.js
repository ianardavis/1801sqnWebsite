function getSupplier() {
    get({
        table: 'supplier',
        query: [`"supplier_id":"${path[2]}"`]
    })
    .then(function ([supplier, options]) {
        set_breadcrumb({text: supplier.name});
        set_innerText({id: 'supplier_name',         text: supplier.name});
        set_innerText({id: 'supplier_account',      text: (supplier.account ? print_account(supplier.account) : '')});
        set_innerText({id: 'supplier_is_stores',    text: yesno(supplier.is_stores)});
        set_attribute({id: 'supplier_account_link', attribute: 'data-id', value: supplier.account_id});
        document.querySelectorAll('.supplier_id').forEach(e => e.value = supplier.supplier_id);
    })
    .catch(err => window.location.replace('/suppliers'));
};
addReloadListener(getSupplier);