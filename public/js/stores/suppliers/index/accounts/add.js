window.addEventListener( "load", function () {
    modalOnShow('supplier_add', listAccounts);
    document.querySelector('#reload_accounts').addEventListener('click', listAccounts);
});