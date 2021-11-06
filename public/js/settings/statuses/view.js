function getStatuses() {
    clear('tbl_statuses')
    .then(tbl_statuses => {
        let sort_cols = tbl_statuses.parentNode.querySelector('.sort') || null;
        get({
            table: 'statuses',
            sort:  (sort_cols ? {col: sort_cols.dataset.sort_col, dir: sort_cols.dataset.sort_dir} : null)
        })
        .then(function ([statuses, options]) {
            statuses.forEach(status => {
                let row = tbl_statuses.insertRow(-1);
                add_cell(row, {text: status._status});
                add_cell(row, {classes: ['statuses'], data: [{field: 'id', value: status.status_id}]})
            });
        });
    });
};