window.addEventListener('load', function () {
    enable_button('delete');
    addFormListener(
        'stock_delete',
        'DELETE',
        `/stocks/${path[2]}`,
        {redirect: '/items'}
    );
});