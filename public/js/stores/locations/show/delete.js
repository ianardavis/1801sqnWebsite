window.addEventListener( "load", function () {
    enable_button('delete');
    addFormListener(
        'delete',
        'DELETE',
        `/locations/${path[2]}`,
        {redirect: '/'}
    );
});