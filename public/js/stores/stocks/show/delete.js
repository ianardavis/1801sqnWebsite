window.addEventListener('load', function () {
    enable_button('delete');
    addFormListener(
        'delete',
        'DELETE',
        `/stocks/${path[2]}`,
        {redirect: '/items'}
    );
});