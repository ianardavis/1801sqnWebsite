function getRanks() {
    listRanks({
        select: 'ranks',
        blank: true,
        blank_text: 'All'
    })
};
function getStatuses() {
    listStatuses({
        select: 'statuses',
        blank: true,
        blank_text: 'All'
    })
};
function getUsers() {
    clear_table('users')
    .then(tbl_users => {
        let ranks    = document.querySelector('#sel_ranks')    || {value: ''},
            statuses = document.querySelector('#sel_statuses') || {value: ''};
        get({
            table: 'users',
            query: [ranks.value, statuses.value],
        })
        .then(function ([users, options]) {
            users.forEach(user => {
                let row = tbl_users.insertRow(-1);
                add_cell(row, {append: new Checkbox({small: true, attributes: [{field: 'data-id', value: user.user_id}]}, {field: 'name', value: 'user'}).e});
                add_cell(row, {text: user.service_number});
                add_cell(row, {text: print_user(user)});
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
    } else alert('Source window not found');
};
window.addEventListener('load', function () {
    addClickListener('reload_ranks', getRanks);
    addClickListener('reload_statuses', getStatuses);
    document.querySelector('#sel_ranks').addEventListener('change', getUsers);
    document.querySelector('#sel_statuses').addEventListener('change', getUsers);
    addClickListener('btn_select', selectUsers);
    getRanks();
    getStatuses();
    getUsers();
})