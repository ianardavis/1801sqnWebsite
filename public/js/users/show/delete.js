window.addEventListener('load', function () {
    enable_button('user_delete');
    addFormListener(
        'delete',
        'DELETE',
        `/users/${path[2]}`,
        {redirect: '/users'}
    );
});