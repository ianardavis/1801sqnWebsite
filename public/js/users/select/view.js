function getUsers() {
    clear('tbl_users')
    .then(tbl_users => {
        let where = {},
            ranks    = getSelectedOptions('sel_ranks'),
            statuses = getSelectedOptions('sel_statuses');
        if (ranks   .length > 0) where.rank_id   = ranks;
        if (statuses.length > 0) where.status_id = statuses;
        get({
            table: 'users',
            where: where
        })
        .then(function ([result, options]) {
            result.users.forEach(user => {
                let row = tbl_users.insertRow(-1);
                add_cell(row, {append: new Checkbox({
                    small: true,
                    attributes: [
                        {field: 'data-id', value: user.user_id},
                        {field: 'name', value: 'user'}
                    ]
                }).e});
                add_cell(row, {text: user.service_number});
                add_cell(row, {text: user.rank.rank});
                add_cell(row, {text: user.surname});
                add_cell(row, {text: user.first_name});
            });
        })
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
};
function selectUsers() {
    if (window.opener.selectedUsers) {
        let users = [];
        document.querySelectorAll("input[type='checkbox']:checked").forEach(e => {
            users.push(e.dataset.id);
            e.checked = false;
        });
        window.opener.selectedUsers(users);
    } else alert_toast('Source window not found');
};
window.addEventListener('load', function () {
    add_listener('tbl_users', toggle_checkbox_on_row_click);
    add_listener('sel_ranks',    getUsers, 'change');
    add_listener('sel_statuses', getUsers, 'change');
    add_listener('btn_select',   selectUsers);
    listRanks();
    listStatuses();
    add_sort_listeners('users', getUsers);
    getUsers();
})