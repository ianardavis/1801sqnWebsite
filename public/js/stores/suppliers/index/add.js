window.addEventListener( "load", function () {
    $('#mdl_supplier_add').on('show.bs.modal', listAccounts)
    addFormListener(
        'supplier_add',
        'POST',
        '/stores/suppliers',
        {onComplete: getSuppliers}
    );
});