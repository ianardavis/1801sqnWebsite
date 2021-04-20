window.addEventListener( "load", function () {
    enable_button('delete');
    addFormListener(
        'item_delete',
        'DELETE',
        `/items/${path[2]}`,
        {redirect: '/items'}
    );
});