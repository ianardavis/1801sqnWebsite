window.addEventListener( "load", function () {
    enable_button('delete');
    addFormListener(
        'size_delete',
        'DELETE',
        `/sizes/${path[2]}`,
        {redirect: '/items'}
    );
});