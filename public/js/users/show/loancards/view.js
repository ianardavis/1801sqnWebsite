const loancard_statuses = {
    '0': 'Cancelled',
    '1': 'Draft',
    '2': 'Open',
    '3': 'Closed'
};
function getLoancards () {
    clear('tbl_loancards')
    .then(tbl_loancards => {
        let where = {user_id_loancard: path[2]};
        const statuses = getSelectedOptions('sel_loancard_statuses');
        if (statuses.length > 0) where.status = statuses;
        get({
            table: 'loancards',
            where: where,
            func: getLoancards
        })
        .then(function ([result, options]) {
            setCount('loancards', result.count);
            result.loancards.forEach(loancard => {
                let row = tbl_loancards.insertRow(-1);
                addCell(row, tableDate(loancard.createdAt));
                addCell(row, {text: loancard.lines.length || '0'});
                addCell(row, {text: loancard_statuses[loancard.status]})
                addCell(row, {append: new Link(`/loancards/${loancard.loancard_id}`).e});
            });
        });
    })
    .catch(err => console.error(err));
};
window.addEventListener('load', function () {
    addListener('reload', getLoancards);
    addListener('sel_loancard_statuses', getLoancards, 'change');
    addSortListeners('loancards', getLoancards);
    getLoancards();
});