function listUsers(options = {}) {
    clear_select(options.select)
    .then(sel_users => {
        get({
            table:   options.table || 'users',
            spinner: options.spinner || options.table || 'users',
            ...options
        })
        .then(function ([users, options]) {
            if (options.blank) sel_users.appendChild(new Option({text: options.blank_text || ''}).e);
            users.forEach(user => {
                sel_users.appendChild(
                    new Option({
                        value:    (options.id_only ? user.user_id : `user_id${options.append || ''}=${user.user_id}`),
                        text:     print_user(user),
                        selected: (options.selected === user.user_id)
                    }).e
                );
            });
        });
    })
};