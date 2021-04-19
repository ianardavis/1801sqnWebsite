function selectedUsers(users) {
    if (users) {
        let tbl_users = document.querySelector('#tbl_issue_add')
        users.forEach(user => {
            get({
                table: 'user',
                query: [`user_id=${user}`]
            })
            .then(function([user, options]) {
                let row = tbl_issue_add.insertRow(-1);
                add_cell(row, {text: user.user_id});
                add_cell(row, {text: print_user(user)});
                add_cell(row, {append: new Input().e});
                add_cell(row, {text: 'db'});
            });
        });
    };
};
window.addEventListener('load', function () {
    enable_button('issue_add');
    document.querySelector('#btn_issue_users').addEventListener('click', function () {
        selectUser();
    });
});