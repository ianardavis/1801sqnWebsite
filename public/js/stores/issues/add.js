function reset_issue_add() {
    clear('tbl_issue_users_add');
    clear('tbl_issue_sizes_add');
    setValue('issue_add_qty', '1');
};
let row_count_sizes = 0;
let row_count_users = 0;
function selectedSizes(sizes) {
    if (sizes) {
        if (!Array.isArray(sizes)) sizes = [sizes];
        let tbl_issue_sizes_add = document.querySelector('#tbl_issue_sizes_add'),
            qty = document.querySelector('#issue_add_qty') || {value: '1'};
            sizes.forEach(size_id => {
                get({
                    table: 'size',
                    where: {size_id: size_id}
                })
                .then(function([size, options]) {
                    if (size.issueable && !tbl_issue_sizes_add.querySelector(`#size-${size.size_id}`)) {
                        let row = tbl_issue_sizes_add.insertRow(-1);
                        row.setAttribute('id', `size-${size.size_id}`);
                        addCell(row, {text: size.item.description});
                        addCell(row, {
                            text: size.size1,
                            append: new Hidden_Input({
                                attributes: [
                                    {field: 'name',  value: `issues[sizes][][${row_count_sizes}][size_id]`},
                                    {field: 'value', value: size.size_id}
                                ]
                            }).e
                        });
                        addCell(row, {text: size.size2});
                        addCell(row, {text: size.size3});
                        addCell(row, {append: new Number_Input({
                            attributes: [
                                {field: 'name',  value: `issues[sizes][][${row_count_sizes}][qty]`},
                                {field: 'value', value: qty.value}
                            ]
                        }).e});
                        let delete_button = new Button({
                            small: true,
                            type: 'delete',
                            attributes: [{field: 'type', value: 'button'}],
                            data: [{field: 'id', value: size.size_id}]
                        }).e
                        delete_button.addEventListener('click', function () {removeID(`size-${this.dataset.id}`)});
                        addCell(row, {append: delete_button});
                        row_count_sizes++;
                    };
                });
            });
    };
};
function selectedUsers(users) {
    if (users) {
        if (!Array.isArray(users)) users = [users];
        let tbl_issue_users_add = document.querySelector('#tbl_issue_users_add'),
            qty           = document.querySelector('#issue_add_qty') || {value: '1'};
        users.forEach(user => {
            get({
                table: 'user',
                where: {user_id: user}
            })
            .then(function([user, options]) {
                if (!tbl_issue_users_add.querySelector(`#user-${user.user_id}`)) {
                    let row = tbl_issue_users_add.insertRow(-1);
                    row.setAttribute('id', `user-${user.user_id}`);
                    addCell(row, {text: user.service_number});
                    addCell(row, {
                        text: printUser(user),
                        append: new Hidden_Input({
                            attributes: [
                                {field: 'name',  value: `issues[users][][${row_count_users}][user_id_issue]`},
                                {field: 'value', value: user.user_id}
                            ]
                        }).e
                    });
                    let delete_button = new Button({
                        small: true,
                        type: 'delete',
                        attributes: [{field: 'type', value: 'button'}],
                        data: [{field: 'id', value: user.user_id}]
                    }).e
                    delete_button.addEventListener('click', function () {removeID(`user-${this.dataset.id}`)});
                    addCell(row, {append: delete_button});
                    row_count_users++;
                };
            });
        });
    };
};
window.addEventListener('load', function () {
    enableButton("issue_add");
    addListener('btn_issue_sizes', selectSize);
    addListener('btn_issue_users', selectUser);
    modalOnShow('issue_add', reset_issue_add);
    addFormListener(
        'issue_add',
        'POST',
        '/issues',
        {
            onComplete: [
                get_issues,
                function () {modalHide('issue_add')}
            ]
        }
    );
});