function getStatuses() {
    let tbl_statuses = document.querySelector('#tbl_statuses');
    if (tbl_statuses) {
        tbl_statuses.innerHTML = '';
        get({table: 'statuses'})
        .then(function ([statuses, options]) {
            statuses.forEach(status => {
                let row = tbl_statuses.insertRow(-1);
                add_cell(row, {text: status._status});
                add_cell(row, {classes: ['statuses'], data: [{field: 'id', value: status.status_id}]})
            });
        });
    };
};