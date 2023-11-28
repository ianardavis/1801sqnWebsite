window.addEventListener('load', function () {
    addFormListener(
        'session_add',
        'POST',
        `/sessions`,
        {redirect: '/pos'}
    );
});