function getUser() {
    get({
        table: 'user',
        query: [`user_id=${path[2]}`]
    })
    .then(function ([user, options]) {
        set_innerText({id: 'service_number', text: user.service_number});
        set_innerText({id: 'rank',           text: user.rank.rank});
        set_innerText({id: 'surname',        text: user.surname});
        set_innerText({id: 'first_name',     text: user.first_name});
        set_innerText({id: 'status',         text: user.status.status});
        set_innerText({id: 'login_id',       text: user.login_id});
        set_innerText({id: 'last_login',     text: print_date(user.last_login, true)});
        set_innerText({id: 'reset',          text: yesno(user.reset)});
        set_breadcrumb({text: print_user(user)});
        let user_ids  = document.querySelectorAll('.user_id');
        user_ids.forEach(e => e.value = user.user_id);
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