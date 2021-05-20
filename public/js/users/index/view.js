function getUsers() {
    clear_table('users')
    .then(tbl => {
        let status = document.querySelector('#sel_statuses') || {value: ''},
            rank   = document.querySelector('#sel_ranks')    || {value: ''};
        get({
            table: 'users',
            query: [status.value, rank.value]
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
        select: 'statuses',
        blank: true,
        blank_text: 'All'
    });
};
function getRanks() {
    listRanks({
        select: 'ranks',
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