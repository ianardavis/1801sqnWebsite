window.addEventListener( "load", function () {
    modalOnShow('supplier_add', listAccounts);
    add_listener('reload_accounts', listAccounts);
    enable_button('supplier_add');
    addFormListener(
        'supplier_add',
        'POST',
        '/suppliers',
        {onComplete: getSuppliers}
    );
});