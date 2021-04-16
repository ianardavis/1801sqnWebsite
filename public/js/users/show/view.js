function getUser() {
    get(
        {
            table: 'user',
            query: [`user_id=${path[2]}`]
        },
        function (user, options) {
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
        }
    );
};
window.addEventListener('load', function () {
    addFormListener(
        'user_password',
        'PUT',
        `/password/${path[2]}`,
        {
            onComplete: [
                getUser,
                function () {$('#mdl_user_password').modal('hide')}
            ]
        }
    );
    document.querySelector('#reload').addEventListener('click', getUser);
});