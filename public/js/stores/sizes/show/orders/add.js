window.addEventListener( "load", function () {
    remove_attribute({id: 'btn_order_add', attribute: 'disabled'});
    addFormListener(
        'form_order_add',
        'POST',
        '/stores/orders',
        {onComplete: getOrders}
    );
});