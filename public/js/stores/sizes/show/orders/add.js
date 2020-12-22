window.addEventListener( "load", function () {
    addFormListener(
        'form_order_add',
        'POST',
        '/stores/order_lines',
        {onComplete: getOrders}
    );
});