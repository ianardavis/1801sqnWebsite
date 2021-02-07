window.addEventListener("load", function () {
    remove_attribute({id: 'btn_supplier_delete', attribute: 'disabled'});
    addFormListener(
        'supplier_delete',
        'DELETE',
        `/stores/suppliers/${path[3]}`
    )
});