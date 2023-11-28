function get_users() {
    clear('tbl_users')
    .then(tbl_users => {
        function add_line(user) {
            let row = tbl_users.insertRow(-1);
            addCell(row, {text: user.surname});
            addCell(row, {text: user.first_name});
            addCell(row, {append: new Link(`/users/${user.user_id}`).e});
        };
        get({
            table: 'users',
            location: 'demand/users',
            where: {demand_id: path[2]},
            func: get_users
        })
        .then(function ([results, options]) {
            setCount('user', results.length);
            results.forEach(user => {
                add_line(user);
            });
        });
    });
};

window.addEventListener('load', function () {
    addListener('reload', get_users);

    addSortListeners('users', get_users);
    get_users();
});