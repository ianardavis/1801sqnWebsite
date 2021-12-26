function getRanks() {
    listRanks({
        select: 'sel_ranks',
        blank: true,
        blank_text: 'All'
    })
};
function getStatuses() {
    listStatuses({
        select: 'sel_statuses',
        blank: true,
        blank_text: 'All'
    })
};
function getUsers() {
    clear('tbl_users')
    .then(tbl_users => {
        let ranks     = document.querySelector('#sel_ranks')    || {value: ''},
            statuses  = document.querySelector('#sel_statuses') || {value: ''},
            where = {};
        if (ranks   .value !== '') where.rank_id = ranks.value;
        if (statuses.value !== '') where.status_id = statuses.value;
        get({
            table: 'users_current',
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
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
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
    addListener('tbl_users', toggle_checkbox_on_row_click);
    addListener('reload_ranks',    getRanks);
    addListener('reload_statuses', getStatuses);
    addListener('sel_ranks',       getUsers, 'change');
    addListener('sel_statuses',    getUsers, 'change');
    addListener('btn_select',      selectUsers);
    getRanks();
    getStatuses();
    getUsers();
})