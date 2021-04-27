window.addEventListener( "load", function () {
    enable_button('delete');
    addFormListener(
        'delete',
        'DELETE',
        `/items/${path[2]}`,
        {redirect: '/items'}
    );
});