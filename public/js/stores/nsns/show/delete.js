window.addEventListener('load', function () {
    enable_button('delete');
    addFormListener(
        'delete',
        'DELETE',
        `/nsns/${path[2]}`,
        {redirect: '/items'}
    );
});