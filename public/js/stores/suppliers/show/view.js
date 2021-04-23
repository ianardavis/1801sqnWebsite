function getSupplier() {
    get({
        table: 'supplier',
        query: [`supplier_id=${path[2]}`]
    })
    .then(function ([supplier, options]) {
        set_breadcrumb({text: supplier.name});
        set_innerText({id: 'name', text: supplier.name});
        if (supplier.account) {
            set_innerText({id: 'account',      text: print_account(supplier.account)});
            set_attribute({id: 'account_link', attribute: 'data-id', value: supplier.account_id})
        };
        set_innerText({id: 'is_stores',    text: yesno(supplier.is_stores)});
        document.querySelectorAll('.supplier_id').forEach(e => e.value = supplier.supplier_id);
    })
};
addReloadListener(getSupplier);