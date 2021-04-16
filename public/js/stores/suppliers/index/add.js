window.addEventListener( "load", function () {
    $('#mdl_supplier_add').on('show.bs.modal', listAccounts)
    addFormListener(
        'supplier_add',
        'POST',
        '/suppliers',
        {onComplete: getSuppliers}
    );
    document.querySelector('#reload_accounts').addEventListener('click', listAccounts);
});