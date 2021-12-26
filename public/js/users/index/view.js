function getUsers() {
    clear('tbl_users')
    .then(tbl => {
        let status = document.querySelector('#sel_statuses') || {value: ''},
            rank   = document.querySelector('#sel_ranks')    || {value: ''},
            where = {};
            if (status.value !== '') where.status_id = status.value;
            if (rank  .value !== '') where.rank_id = rank.value;
        get({
            table: 'users',
            where: where
        })
        .then(function ([result, options]) {
            result.users.forEach(user => {
                let row = tbl.insertRow(-1);
                add_cell(row, {text: user.service_number});
                add_cell(row, {text: user.rank.rank});
                add_cell(row, {text: user.surname});
                add_cell(row, {text: user.first_name});
                add_cell(row, {append: new Link({href: `/users/${user.user_id}`}).e});
            });
        });
    })
    .catch(err => console.log(err));
};
function getStatuses() {
    return listStatuses({
        select: 'sel_statuses',
        blank: true,
        blank_text: 'All',
        id_only: true
    });
};
function getRanks() {
    return listRanks({
        select: 'sel_ranks',
        blank: true,
        blank_text: 'All',
        id_only: true
    });
};
addReloadListener(getUsers);
sort_listeners(
    'users',
    getUsers,
    [
        {value: 'createdAt',      text: 'Created'},
        {value: 'service_number', text: 'Service #/Bader #', selected: true},
        {value: 'rank_id',        text: 'Rank'},
        {value: 'surname',        text: 'Surname'},
        {value: 'first_name',     text: 'First Name'}
    ]
);
window.addEventListener("load", function () {
    addListener('sel_statuses', getUsers, 'change');
    addListener('sel_ranks',    getUsers, 'change');
    addListener('reload_statuses', getStatuses);
    addListener('reload_ranks',    getRanks);
	Promise.allSettled([
		getStatuses(),
		getRanks()
	])
	.then(results => getUsers())
	.catch(err => {
		console.log(err);
		getUsers();
	});
});