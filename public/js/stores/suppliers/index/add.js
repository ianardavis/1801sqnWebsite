window.addEventListener( "load", function () {
    modalOnShow('supplier_add', listAccounts);
    addListener('reload_accounts', listAccounts);
    enableButton('supplier_add');
    addFormListener(
        'supplier_add',
        'POST',
        '/suppliers',
        {onComplete: getSuppliers}
    );
});