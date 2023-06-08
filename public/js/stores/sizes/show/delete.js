const enable_delete = enable_button('delete');
window.addEventListener( "load", function () {
    enable_button('delete');
    addFormListener(
        'delete',
        'DELETE',
        `/sizes/${path[2]}`,
        {redirect: '/items'}
    );
});