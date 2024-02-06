function getUsers() {
    Promise.all([
        clear('tbl_users'),
        getSelectedOptions('sel_ranks'),
        getSelectedOptions('sel_statuses')
    ])
    .then(([tbl_users, ranks, statuses]) => {
        let where = {};
        if (ranks   .length > 0) where.rank_id   = ranks;
        if (statuses.length > 0) where.status_id = statuses;
        get({
            table: 'users',
            where: where,
            func:  getUsers
        })
        .then(function ([result, options]) {
            result.users.forEach(user => {
                let row = tbl_users.insertRow(-1);
                addCell(row, {text: user.service_number});
                addCell(row, {text: user.rank.rank});
                addCell(row, {text: user.surname});
                addCell(row, {text: user.first_name});
                addCell(row, {append: new Link(`/users/${user.user_id}`).e});
            });
        });
    })
    .catch(err => console.error(err));
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
window.addEventListener("load", function () {
    addListener('reload',          getUsers);
    addListener('sel_statuses',    getUsers, 'change');
    addListener('sel_ranks',       getUsers, 'change');
    addListener('reload_statuses', getStatuses);
    addListener('reload_ranks',    getRanks);
	Promise.allSettled([
		getStatuses(),
		getRanks()
	])
	.then(getUsers)
	.catch(err => {
		console.error(err);
		getUsers();
	});
    addSortListeners('users', getUsers);
});