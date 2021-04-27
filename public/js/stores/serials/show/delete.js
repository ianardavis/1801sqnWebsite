window.addEventListener('load', function () {
    enable_button('delete');
    addFormListener(
        'delete',
        'DELETE',
        `/serials/${path[2]}`,
        {redirect: '/items'}
    );
});