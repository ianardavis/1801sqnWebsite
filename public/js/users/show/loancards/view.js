let loancard_statuses = {'0': 'Cancelled', '1':'Draft', '2': 'Open', '3': 'Closed'};
function getLoancards () {
    clear('tbl_loancards')
    .then(tbl_loancards => {
        let where = {user_id_loancard: path[2]},
            statuses = getSelectedOptions('sel_loancard_statuses');
        if (statuses.length > 0) where.status = statuses;
        get({
            table: 'loancards',
            where: where,
            func: getLoancards
        })
        .then(function ([result, options]) {
            set_count('loancards', result.count);
            result.loancards.forEach(loancard => {
                let row = tbl_loancards.insertRow(-1);
                add_cell(row, table_date(loancard.createdAt));
                add_cell(row, {text: loancard.lines.length || '0'});
                add_cell(row, {text: loancard_statuses[loancard.status]})
                add_cell(row, {append: new Link(`/loancards/${loancard.loancard_id}`).e});
            });
        });
    })
    .catch(err => console.log(err));
};
window.addEventListener('load', function () {
    add_listener('reload', getLoancards);
    add_listener('sel_loancard_statuses', getLoancards, 'change');
    add_sort_listeners('loancards', getLoancards);
    getLoancards();
});