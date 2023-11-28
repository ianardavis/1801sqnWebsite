window.addEventListener('load', function () {
    addFormListener(
        'user_password',
        'PUT',
        `/password/${path[2]}`,
        {redirect: '/resources'}
    );
});