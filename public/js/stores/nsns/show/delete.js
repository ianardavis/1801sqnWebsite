window.addEventListener('load', function () {
    enable_button('delete');
    addFormListener(
        'nsn_delete',
        'DELETE',
        `/nsns/${path[2]}`,
        {redirect: '/items'}
    );
});