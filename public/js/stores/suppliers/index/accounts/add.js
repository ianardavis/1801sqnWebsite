window.addEventListener( "load", function () {
    modalOnShow('supplier_add', listAccounts);
    addListener('reload_accounts', listAccounts);
});