function listUsers(options = {}) {
    let select = document.querySelector(`#${options.select}`);
    if (select) {
        select.innerHTML = '';
        get(
            {
                table:   options.table || 'users',
                spinner: options.spinner || options.table || 'users',
                ...options
            },
            function (users, options) {
                if (options.blank) select.appendChild(new Option(options.blank_opt || {}).e);
                users.forEach(user => {
                    let value = '';
                    if (options.id_only) value = user.user_id
                    else                 value = `user_id${options.append || ''}=${user.user_id}`
                    select.appendChild(
                        new Option({
                            value:    value,
                            text:     print_user(user),
                            selected: (options.selected === user.user_id)
                        }).e
                    );
                });
                if (options.onComplete) options.onComplete();
            }
        );
    } else if (options.onComplete) options.onComplete();
};