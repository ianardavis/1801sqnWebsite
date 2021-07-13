function getStatuses() {
    clear('tbl_statuses')
    .then(tbl_statuses => {
        get({table: 'statuses'})
        .then(function ([statuses, options]) {
            statuses.forEach(status => {
                let row = tbl_statuses.insertRow(-1);
                add_cell(row, {text: status._status});
                add_cell(row, {classes: ['statuses'], data: [{field: 'id', value: status.status_id}]})
            });
        });
    });
};