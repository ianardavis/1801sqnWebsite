window.addEventListener('load', function () {
    enableButton('user_delete');
    addFormListener(
        'delete',
        'DELETE',
        `/users/${path[2]}`,
        {redirect: '/users'}
    );
});