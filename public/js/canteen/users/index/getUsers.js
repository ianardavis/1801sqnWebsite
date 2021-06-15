function getUsers () {
    let sel_status = document.querySelector('#sel_status');
    get(
        {
            table: 'users',
            query: [sel_status.value || null]
        },
        function (users, options) {
            clearElement('tbl_users');
            let tbl_users = document.querySelector('#tbl_users');
            users.forEach(user => {
                let row = tbl_users.insertRow(-1);
                add_cell(row, {text: print_user(user)});
                add_cell(row, {text: user.status.status});
                add_cell(row, {append: new Link({
                    href: `/canteen/users/${user.user_id}`,
                    small: true
                }).e})
            })
        }
    );
    document.querySelector('#reload').addEventListener('click', getUsers);
    sel_status.addEventListener('change', getUsers);
};