window.addEventListener( "load", function () {
    enable_button('supplier_add');
    addFormListener(
        'supplier_add',
        'POST',
        '/suppliers',
        {onComplete: getSuppliers}
    );
});