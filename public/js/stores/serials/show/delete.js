window.addEventListener('load', function () {
    enableButton('delete');
    addFormListener(
        'delete',
        'DELETE',
        `/serials/${path[2]}`,
        {redirect: '/items'}
    );
});