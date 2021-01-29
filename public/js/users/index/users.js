function getUsers() {
    let status = document.querySelector('#status_id') || {value: ''},
        rank   = document.querySelector('#rank_id')   || {value: ''};
    get(
        function (users, options) {
            let table_body = document.querySelector('#tbl_users');
            if (table_body) {
                table_body.innerHTML = '';
                users.forEach(user => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {text: user._bader});
                    add_cell(row, {text: user.rank._rank});
                    add_cell(row, {text: user._name});
                    add_cell(row, {text: user._ini});
                    add_cell(row, {append: new Link({
                        href: `/${path[1]}/users/${user.user_id}`,
                        small: true
                    }).e});
                });
            };
        },
        {
            db: 'users',
            table: 'users',
            query: [status.value, rank.value]
        }
    );
};
let int_load_users = window.setInterval(
    function () {
        if (statuses_loaded === true && ranks_loaded === true) {
            window.clearInterval(int_load_users);
            getUsers();
        }
    },
    100
);
window.addEventListener("load", function () {
    document.querySelector('#reload')   .addEventListener('click', getUsers);
    document.querySelector('#status_id').addEventListener("change", getUsers);
    document.querySelector('#rank_id')  .addEventListener("change", getUsers);
});