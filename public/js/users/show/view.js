function getUser() {
    get(
        {
            db: 'users',
            table: 'user',
            query: [`user_id=${path[3]}`]
        },
        function (user, options) {
            set_innerText({id: '_bader',      text: user._bader});
            set_innerText({id: 'rank',        text: user.rank._rank});
            set_innerText({id: '_name',       text: user._name});
            set_innerText({id: '_ini',        text: user._ini});
            set_innerText({id: 'status',      text: user.status._status});
            set_innerText({id: '_login_id',   text: user._login_id});
            set_innerText({id: '_last_login', text: print_date(user._last_login, true)});
            set_innerText({id: '_reset',      text: yesno(user._reset)});
            let user_ids  = document.querySelectorAll('.user_id');
            user_ids.forEach(e => e.value = user.user_id);
            set_breadcrumb({text: print_user(user), href: `/${path[1]}/users/${user.user_id}`});
        }
    );
};
window.addEventListener('load', function () {
    addFormListener(
        'user_password',
        'PUT',
        `/users/password/${path[3]}`,
        {
            onComplete: [
                getUser,
                function () {$('#mdl_user_password').modal('hide')}
            ]
        }
    );
    document.querySelector('#reload').addEventListener('click', getUser);
});