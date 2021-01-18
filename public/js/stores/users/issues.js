let issue_statuses = {'0': 'Cancelled', '1':'Requested', '2': 'Approved', '3': 'Ordered', '4': 'Issued', '5': 'Returned'};
function getIssues () {
    let sel_status = document.querySelector('#sel_status') || {value: ''};
    get(
        function (lines, options) {
            set_count({id: 'issue', count: lines.length || '0'})
            let table_body = document.querySelector('#tbl_issues');
            if (table_body) {
                table_body.innerHTML = '';
                lines.forEach(line => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, table_date(line.createdAt));
                    if (line.size) {
                        if (line.size.item) add_cell(row, {text: line.size.item._description});
                        else add_cell(row);
                        add_cell(row, {text: line.size._size});
                    } else add_cell(row);
                    add_cell(row, {text: line._qty});
                    add_cell(row, {text: issue_statuses[line._status]})
                    add_cell(row, {
                        append: new Link({
                            href: `/stores/issues/${line.issue_id}`,
                            small: true
                        }).e
                    });
                });
            };
        },
        {
            table: 'issues',
            query: [sel_status.value]
        }
    );
};
document.querySelector('#reload')    .addEventListener('click',  getIssues);
document.querySelector('#sel_status').addEventListener('change', getIssues);