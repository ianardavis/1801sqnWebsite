function getUser() {
    get({
        table: 'user',
        where: {user_id: path[2]}
    })
    .then(function ([user, options]) {
        setBreadcrumb(printUser(user));
        setInnerText('service_number', user.service_number);
        setInnerText('rank',           user.rank.rank);
        setInnerText('surname',        user.surname);
        setInnerText('first_name',     user.first_name);
        setInnerText('status',         user.status.status);
        setInnerText('login_id',       user.login_id);
        setInnerText('last_login',     printDate(user.last_login, true));
        setInnerText('reset',          yesno(user.reset));
        document.querySelectorAll('.user_id').forEach(e => e.value = user.user_id);
    });
};
window.addEventListener('load', function () {
    addListener('reload', getUser);
    document.querySelectorAll('.user_id').forEach(e => e.value = path[2]);
    enableButton('user_password');
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
    getUser();
});