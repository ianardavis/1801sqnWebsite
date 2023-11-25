window.addEventListener('load', function () {
    enableButton('delete');
    addFormListener(
        'delete',
        'DELETE',
        `/nsns/${path[2]}`,
        {redirect: '/items'}
    );
});