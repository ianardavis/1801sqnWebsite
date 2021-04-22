function listUsers(options = {}) {
    clear_select(options.select)
    .then(sel_users => {
        get({
            table:   options.table || 'users',
            spinner: options.spinner || options.table || 'users',
            ...options
        })
        .then(function ([users, options]) {
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
        });
    })
};