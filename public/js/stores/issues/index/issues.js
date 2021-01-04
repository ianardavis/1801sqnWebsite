function getIssues() {
    let sel_status = document.querySelector('#sel_status') || {value: ''},
        statuses = {"0": "Cancelled", "1": "Draft", "2": "Open", "3": "Closed"};
    get(
        function (issues, options) {
            clearElement('tbl_issues');
            let table_body = document.querySelector('#tbl_issues');
            issues.forEach(issue => {
                let row = table_body.insertRow(-1);
                add_cell(row, {text: print_user(issue.user_issue)});
                add_cell(row, {
                    sort: new Date(issue.createdAt).getTime(),
                    text: print_date(issue.createdAt)
                });
                add_cell(row, {text: issue.lines.length || '0'});
                add_cell(row, {text: statuses[issue._status]});
                add_cell(row, {append: new Link({href: `/stores/issues/${issue.issue_id}`, small: true}).e});
            });
        },
        {
            table: 'issues',
            query: [sel_status.value]
        }
    );
};
document.querySelector('#reload')    .addEventListener('click',  getIssues);
document.querySelector('#sel_status').addEventListener('change', getIssues);