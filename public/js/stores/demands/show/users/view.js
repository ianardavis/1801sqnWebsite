function get_users() {
    clear('tbl_users')
    .then(tbl_users => {
        get({
            table: 'users',
            location: 'demand/users',
            where: {demand_id: path[2]},
            func: get_users
        })
        .then(function ([results, options]) {
            set_count('user', results.length);
            results.forEach(user => {
                let row = tbl_users.insertRow(-1);
                add_cell(row, {text: user.surname});
                add_cell(row, {text: user.first_name});
                add_cell(row, {append: new Link(`/users/${user.user_id}`).e});
            });
        });
    });
};

window.addEventListener('load', function () {
    add_listener('reload', get_users);

    add_sort_listeners('users', get_users);
    get_users();
});