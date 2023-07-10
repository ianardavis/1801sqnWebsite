const enable_add_order = enable_button('order_add');
window.addEventListener( "load", function () {
    enable_button('order_add');
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