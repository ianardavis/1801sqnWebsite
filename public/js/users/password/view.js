function redirect() {
    window.location.assign('/resources')
};
window.addEventListener('load', function () {
    addFormListener(
        'user_password',
        'PUT',
        `/password/${path[2]}`,
        {onComplete: redirect}
    );
});