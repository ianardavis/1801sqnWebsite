window.addEventListener('load', function () {
    enableButton('delete');
    addFormListener(
        'delete',
        'DELETE',
        `/stocks/${path[2]}`,
        {redirect: '/items'}
    );
});