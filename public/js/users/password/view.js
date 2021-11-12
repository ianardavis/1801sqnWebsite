window.addEventListener('load', function () {
    addFormListener(
        'user_password',
        'PUT',
        `/password/${path[2]}`,
        {onComplete: [window.location.assign('/resources')]}
    );
});