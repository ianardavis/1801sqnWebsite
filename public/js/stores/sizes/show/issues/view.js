let issue_statuses = {'0': 'Cancelled', '1': 'Requested', '2': 'Approved', '3': 'Ordered', '4': 'Issued', '5': 'Returned'};
function getIssues() {
    clear_table('issues')
    .then(tbl_issues => {
        get({
            table: 'issues',
            query: [`size_id=${path[2]}`]
        })
        .then(function ([issues, options]) {
            set_count({id: 'issue', count: issues.length});
            issues.forEach(issue => {
                try {
                    let row = tbl_issues.insertRow(-1);
                    add_cell(row, table_date(issue.createdAt));
                    add_cell(row, {text: print_user(issue.user_issue)});
                    add_cell(row, {text: issue.qty});
                    add_cell(row, {text: issue_statuses[issue.status]});
                    add_cell(row, {append: new Link({
                        href: `/issues/${issue.issue_id}`,
                        small: true
                    }).e});
                } catch (error) {
                    console.log(error);
                };
            });
        });
    })
    .catch(err => console.log(err));
};
addReloadListener(getIssues);