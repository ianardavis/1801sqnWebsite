window.addEventListener( "load", function () {
    enable_button('order_add');
    addFormListener(
        'order_add',
        'POST',
        '/orders',
        {
            onComplete: [
                getOrders,
                function () {modalHide('order_add')}
            ]
        }
    );
});