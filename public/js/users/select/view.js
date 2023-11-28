function getUsers() {
    clear('tbl_users')
    .then(tbl_users => {
        let where = {};
        const ranks    = getSelectedOptions('sel_ranks');
        const statuses = getSelectedOptions('sel_statuses');
        if (ranks   .length > 0) where.rank_id   = ranks;
        if (statuses.length > 0) where.status_id = statuses;
        get({
            table: 'users',
            where: where
        })
        .then(function ([result, options]) {
            result.users.forEach(user => {
                let row = tbl_users.insertRow(-1);
                addCell(row, {append: new Checkbox({
                    small: true,
                    attributes: [
                        {field: 'data-id', value: user.user_id},
                        {field: 'name', value: 'user'}
                    ]
                }).e});
                addCell(row, {text: user.service_number});
                addCell(row, {text: user.rank.rank});
                addCell(row, {text: user.surname});
                addCell(row, {text: user.first_name});
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
    } else alertToast('Source window not found');
};
window.addEventListener('load', function () {
    addListener('tbl_users', toggleCheckboxOnRowClick);
    addListener('sel_ranks',    getUsers, 'change');
    addListener('sel_statuses', getUsers, 'change');
    addListener('btn_select',   selectUsers);
    listRanks();
    listStatuses();
    addSortListeners('users', getUsers);
    getUsers();
})