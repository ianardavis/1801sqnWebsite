function getUsers() {
    clear('tbl_users')
    .then(tbl => {
        let where  = {},
            statuses = getSelectedOptions('sel_statuses'),
            ranks    = getSelectedOptions('sel_ranks');
        if (statuses.length > 0) where.status_id = statuses;
        if (ranks.length > 0) where.rank_id = ranks;
        get({
            table: 'users',
            where: where,
            func:  getUsers
        })
        .then(function ([result, options]) {
            result.users.forEach(user => {
                let row = tbl.insertRow(-1);
                add_cell(row, {text: user.service_number});
                add_cell(row, {text: user.rank.rank});
                add_cell(row, {text: user.surname});
                add_cell(row, {text: user.first_name});
                add_cell(row, {append: new Link(`/users/${user.user_id}`).e});
            });
        });
    })
    .catch(err => console.log(err));
};
function getStatuses() {
    return listStatuses({
        select: 'sel_statuses',
        id_only: true
    });
};
function getRanks() {
    return listRanks({
        select: 'sel_ranks',
        id_only: true
    });
};
addReloadListener(getUsers);
sort_listeners(
    'users',
    getUsers,
    [
        {value: '["createdAt"]',      text: 'Created'},
        {value: '["service_number"]', text: 'Service #/Bader #', selected: true},
        {value: '["rank_id"]',        text: 'Rank'},
        {value: '["surname"]',        text: 'Surname'},
        {value: '["first_name"]',     text: 'First Name'}
    ],
    false
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