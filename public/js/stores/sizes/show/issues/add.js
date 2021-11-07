function selectedUsers(users) {
    if (users) {
        let tbl_issue_add = document.querySelector('#tbl_issue_add'),
            qty           = document.querySelector('#issue_add_qty') || {value: '1'};
        users.forEach(user => {
            get({
                table: 'user',
                query: [`"user_id":"${user}"`]
            })
            .then(function([user, options]) {
                if (!tbl_issue_add.querySelector(`#user-${user.user_id}`)) {
                    let row = tbl_issue_add.insertRow(-1);
                    row.setAttribute('id', `user-${user.user_id}`);
                    add_cell(row, {text: user.service_number});
                    add_cell(row, {text: print_user(user)});
                    add_cell(row, {append: new Input({
                        small: true,
                        attributes: [
                            {field: 'type',  value: 'number'},
                            {field: 'name',  value: `lines[][${user.user_id}][qty]`},
                            {field: 'value', value: qty.value}
                        ]
                    }).e});
                    let delete_button = new Button({
                        small: true,
                        type: 'delete',
                        attributes: [{field: 'type', value: 'button'}],
                        data: [{field: 'id', value: user.user_id}]
                    }).e
                    delete_button.addEventListener('click', function () {removeID(`user-${this.dataset.id}`)});
                    add_cell(row, {append: delete_button});
                };
            });
        });
    };
};
window.addEventListener('load', function () {
    enable_button('issue_add');
    modalOnShow('issue_add', function () {clear('tbl_issue_add')});
    addListener('btn_issue_users', selectUser);
    addFormListener(
        'issue_add',
        'POST',
        `/sizes/${path[2]}/issue`,
        {
            onComplete: [
                getIssues,
                function () {modalHide('issue_add')}
            ]
        }
    );
});