const enable_add_order = enableButton('order_add');
window.addEventListener( "load", function () {
    enableButton('order_add');
    addFormListener(
        'order_add',
        'POST',
        '/orders',
        {
            onComplete: [
                get_orders,
                function () {modalHide('order_add')}
            ]
        }
    );
});