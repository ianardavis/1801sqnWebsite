window.addEventListener('load', function () {
    addFormListener(
        'lines_1',
        'PUT',
        '/orders',
        {
            onComplete: function () {
                getOrders('0');
                getOrders('1');
                getOrders('2');
                getOrders('3');
            }
        }
    );
});