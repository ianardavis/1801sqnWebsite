let issue_statuses = {"0": "Cancelled", "1": "Requested", "2": "Approved", "3": "Ordered", "4": "Issued", "5": "Returned"}
function getIssues() {
    let sel_status = document.querySelector('#sel_status') || {value: ''};
    get(
        function (issues, options) {
            let table_body = document.querySelector('#tbl_issues');
            if (table_body) {
                table_body.innerHTML = '';
                issues.forEach(issue => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {
                        sort: print_date(issue.createdAt),
                        text: new Date(issue.createdAt).toDateString()
                    });
                    add_cell(row, {text: print_user(issue.user_issue)});
                    add_cell(row, {text: issue.size.item._description});
                    add_cell(row, {text: issue_statuses[issue._status] || 'Unknown'});
                    add_cell(row, {append: new Link({href: `/stores/issues/${issue.issue_id}`, small: true}).e});
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