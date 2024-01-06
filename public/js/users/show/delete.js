window.addEventListener('load', function () {
    enableButton('delete');
    addFormListener(
        'delete',
        'DELETE',
        `/users/${path[2]}`,
        {redirect: '/users'}
    );
});