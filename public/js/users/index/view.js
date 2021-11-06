function getUsers() {
    clear('tbl_users')
    .then(tbl => {
        let status    = document.querySelector('#sel_statuses') || {value: ''},
            rank      = document.querySelector('#sel_ranks')    || {value: ''},
            sort_cols = tbl.parentNode.querySelector('.sort') || null;
        get({
            table: 'users',
            query: [status.value, rank.value],
            sort:  (sort_cols ? {col: sort_cols.dataset.sort_col, dir: sort_cols.dataset.sort_dir} : null)
        })
        .then(function ([users, options]) {
            users.forEach(user => {
                let row = tbl.insertRow(-1);
                add_cell(row, {text: user.service_number});
                add_cell(row, {text: user.rank.rank});
                add_cell(row, {text: user.surname});
                add_cell(row, {text: user.first_name});
                add_cell(row, {append: new Link({
                    href: `/users/${user.user_id}`,
                    small: true
                }).e});
            });
        });
    })
    .catch(err => console.log(err));
};
function getStatuses() {
    listStatuses({
        select: 'sel_statuses',
        blank: true,
        blank_text: 'All'
    });
};
function getRanks() {
    listRanks({
        select: 'sel_ranks',
        blank: true,
        blank_text: 'All'
    });
};
addReloadListener(getUsers);
window.addEventListener("load", function () {
    addListener('sel_statuses', getUsers, 'change');
    addListener('sel_ranks',    getUsers, 'change');
    addListener('reload_statuses', getStatuses);
    addListener('reload_ranks',    getRanks);
});