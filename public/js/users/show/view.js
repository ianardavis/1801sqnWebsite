function getUser() {
    get({
        table: 'user',
        query: [`"user_id":"${path[2]}"`]
    })
    .then(function ([user, options]) {
        set_breadcrumb(print_user(user));
        set_innerText('service_number', user.service_number);
        set_innerText('rank',           user.rank.rank);
        set_innerText('surname',        user.surname);
        set_innerText('first_name',     user.first_name);
        set_innerText('status',         user.status.status);
        set_innerText('login_id',       user.login_id);
        set_innerText('last_login',     print_date(user.last_login, true));
        set_innerText('reset',          yesno(user.reset));
        document.querySelectorAll('.user_id').forEach(e => e.value = user.user_id);
    });
};
addReloadListener(getUser);
window.addEventListener('load', function () {
    enable_button('user_password');
    addFormListener(
        'user_password',
        'PUT',
        `/password/${path[2]}`,
        {
            onComplete: [
                getUser,
                function () {modalHide('user_password')}
            ]
        }
    );
});