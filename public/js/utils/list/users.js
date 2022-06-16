function listUsers(options = {}) {
    return new Promise(resolve => {
        clear(options.select || 'sel_users')
        .then(sel_users => {
            get({
                table:   options.table   || 'users',
                spinner: options.spinner || options.table || 'users',
                order: ["surname", "ASC"],
                ...options
            })
            .then(function ([result, options]) {
                if (options.blank) sel_users.appendChild(new Option({text: options.blank.text || ''}).e);
                result.users.forEach(user => {
                    sel_users.appendChild(
                        new Option({
                            value:    user.user_id,
                            text:     print_user(user),
                            selected: (options.selected === user.user_id)
                        }).e
                    );
                });
                resolve(true);
            })
            .catch(err => {
                console.log(err);
                resolve(false);
            });
        })
        .catch(err => {
            console.log(err);
            resolve(false);
        });
    });
};