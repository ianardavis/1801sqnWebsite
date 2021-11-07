let loancard_statuses = {'0': 'Cancelled', '1':'Draft', '2': 'Open', '3': 'Closed'};
function getLoancards () {
    clear('tbl_loancards')
    .then(tbl_loancards => {
        let sel_status = document.querySelector('#sel_status_loancards') || {value: ''},
            sort_cols  = tbl_loancards.parentNode.querySelector('.sort') || null,
            query      = [`"user_id_loancard":"${path[2]}"`];
        if (sel_status.value !== '') query.push(sel_status.value);
        get({
            table: 'loancards',
            query: query,
            ...sort_query(sort_cols)
        })
        .then(function ([loancards, options]) {
            set_count({id: 'loancards', count: loancards.length || '0'});
            loancards.forEach(loancard => {
                let row = tbl_loancards.insertRow(-1);
                add_cell(row, table_date(loancard.createdAt));
                add_cell(row, {text: loancard.lines.length || '0'});
                add_cell(row, {text: loancard_statuses[loancard.status]})
                add_cell(row, {
                    append: new Link({
                        href: `/loancards/${loancard.loancard_id}`,
                        small: true
                    }).e
                });
            });
        });
    })
    .catch(err => console.log(err));
};
addReloadListener(getLoancards)
window.addEventListener('load', function () {
    addListener('sel_status_loancards', getLoancards, 'change');
})