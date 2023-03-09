function getUsers() {
    clear('tbl_users')
    .then(tbl => {
        let where  = {},
            statuses = getSelectedOptions('sel_statuses'),
            ranks    = getSelectedOptions('sel_ranks');
        if (statuses.length > 0) where.status_id = statuses;
        if (ranks   .length > 0) where.rank_id   = ranks;
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
window.addEventListener("load", function () {
    add_listener('reload',          getUsers);
    add_listener('sel_statuses',    getUsers, 'change');
    add_listener('sel_ranks',       getUsers, 'change');
    add_listener('reload_statuses', getStatuses);
    add_listener('reload_ranks',    getRanks);
	Promise.allSettled([
		getStatuses(),
		getRanks()
	])
	.then(results => getUsers())
	.catch(err => {
		console.log(err);
		getUsers();
	});
    add_sort_listeners('users', getUsers);
});