let loancard_statuses = {'0': 'Cancelled', '1':'Draft', '2': 'Open', '3': 'Closed'};
function getLoancards () {
    clear('tbl_loancards')
    .then(tbl_loancards => {
        let sel_status = document.querySelector('#sel_status_loancards') || {value: ''},
            where = {user_id_loancard: path[2]};
        if (sel_status.value !== '') where.status = sel_status.value;
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
                add_cell(row, {append: new Link({href: `/loancards/${loancard.loancard_id}`}).e});
            });
        });
    })
    .catch(err => console.log(err));
};
addReloadListener(getLoancards)
sort_listeners(
    'loancards',
    getLoancards,
    [
        {value: '["createdAt"]', text: 'Created', selected: true},
        {value: '["status"]',    text: 'Status'}
    ]
);
window.addEventListener('load', function () {
    addListener('sel_status_loancards', getLoancards, 'change');
})