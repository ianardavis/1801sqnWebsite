window.addEventListener("load", function () {
    enable_button('supplier_delete');
    addFormListener(
        'supplier_delete',
        'DELETE',
        `/suppliers/${path[2]}`
    );
});