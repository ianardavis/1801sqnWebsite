let issue_statuses = {'0': 'Cancelled', '1':'Requested', '2': 'Approved', '3': 'Ordered', '4': 'Issued', '5': 'Returned'};
function getIssues () {
    clear_table('issues')
    .then(tbl_issues => {
        let sel_status = document.querySelector('#sel_status_issues') || {value: ''};
        get({
            table: 'issues',
            query: [`user_id_issue=${path[2]}`, sel_status.value]
        })
        .then(function ([lines, options]) {
            set_count({id: 'issue', count: lines.length || '0'});
            lines.forEach(line => {
                let row = tbl_issues.insertRow(-1);
                add_cell(row, table_date(line.createdAt));
                if (line.size) {
                    if (line.size.item) add_cell(row, {text: line.size.item.description});
                    else add_cell(row);
                    add_cell(row, {text: line.size.size});
                } else add_cell(row);
                add_cell(row, {text: line.qty});
                add_cell(row, {text: issue_statuses[line.status]})
                add_cell(row, {
                    append: new Link({
                        href: `/issues/${line.issue_id}`,
                        small: true
                    }).e
                });
            });
        });
    })
    .catch(err => console.log(err));
};
addReloadListener(getIssues);
window.addEventListener('load', function () {
    addListener('sel_status_issues', getIssues, 'change')
});