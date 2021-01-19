let users_loaded = false;
function listUsers(options = {}) {
    users_loaded = false;
    get(
        function (users, options) {
            let sel_users = document.querySelector(`#${options.select || 'sel_users'}`);
            if (sel_users) {
                sel_users.innerHTML = '';
                if (options.blank === true) sel_users.appendChild(new Option(options.blank_opt || {}).e);
                users.forEach(user => {
                    let value = '';
                    if (options.id_only) value = user.user_id
                    else                 value = `user_id${options.append || ''}=${user.user_id}`
                    sel_users.appendChild(
                        new Option({
                            value:    value,
                            text:     print_user(user),
                            selected: (options.selected === user.user_id)
                        }).e
                    )
                });
            };
            users_loaded = true;
        },
        {
            table: 'users',
            query: [],
            ...options
        }
    );
};