function reset_issue_add() {
    clear('tbl_issue_users_add');
    clear('tbl_issue_sizes_add');
    set_value('issue_add_qty', '1');
};
let row_count_sizes = 0;
function selectedSizes(sizes) {
    if (sizes) {
        let tbl_issue_sizes_add = document.querySelector('#tbl_issue_sizes_add'),
            qty           = document.querySelector('#issue_add_qty') || {value: '1'};
            sizes.forEach(size => {
                get({
                    table: 'size',
                    query: [`"size_id":"${size}"`],
                    spinner: 'line_add'
                })
                .then(function([size, options]) {
                    if (size.issueable && !tbl_issue_sizes_add.querySelector(`#size-${size.size_id}`)) {
                        let row = tbl_issue_sizes_add.insertRow(-1);
                        row.setAttribute('id', `size-${size.size_id}`);
                        add_cell(row, {text: size.item.description});
                        add_cell(row, {
                            text: print_size(size),
                            append: new Input({
                                attributes: [
                                    {field: 'type',  value: 'hidden'},
                                    {field: 'name',  value: `issues[sizes][][${row_count_sizes}][size_id]`},
                                    {field: 'value', value: size.size_id}
                                ]
                            }).e
                        });
                        add_cell(row, {append: new Input({
                            small: true,
                            attributes: [
                                
                                {field: 'type',  value: 'number'},
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
                        add_cell(row, {append: delete_button});
                        row_count_sizes++;
                    };
                });
            });
    };
};
let row_count_users = 0;
function selectedUsers(users) {
    if (users) {
        let tbl_issue_users_add = document.querySelector('#tbl_issue_users_add'),
            qty           = document.querySelector('#issue_add_qty') || {value: '1'};
        users.forEach(user => {
            get({
                table: 'user',
                query: [`"user_id":"${user}"`]
            })
            .then(function([user, options]) {
                if (!tbl_issue_users_add.querySelector(`#user-${user.user_id}`)) {
                    let row = tbl_issue_users_add.insertRow(-1);
                    row.setAttribute('id', `user-${user.user_id}`);
                    add_cell(row, {text: user.service_number});
                    add_cell(row, {
                        text: print_user(user),
                        append: new Hidden({
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
                    add_cell(row, {append: delete_button});
                    row_count_users++;
                };
            });
        });
    };
};
window.addEventListener('load', function () {
    addListener('btn_issue_sizes', selectSize);
    addListener('btn_issue_users', selectUser);
    modalOnShow('issue_add', reset_issue_add);
    addFormListener(
        'issue_add',
        'POST',
        '/issues',
        {
            onComplete: [
                getIssues,
                function () {modalHide('issue_add')}
            ]
        }
    );
});