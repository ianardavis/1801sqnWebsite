window.addEventListener( "load", function () {
    $('#mdl_supplier_add').on('show.bs.modal', listAccounts);
    document.querySelector('#reload_accounts').addEventListener('click', listAccounts);
});