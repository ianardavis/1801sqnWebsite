let issue_statuses = {'0': 'Cancelled', '1': 'Requested', '2': 'Approved', '3': 'Ordered', '4': 'Issued', '5': 'Returned'};
function getIssues() {
    get(
        function (issues, options) {
            let table_body = document.querySelector('#tbl_issues');
            set_count({id: 'issue', count: issues.length})
            if (table_body) {
                table_body.innerHTML = '';
                issues.forEach(issue => {
                    try {
                        let row = table_body.insertRow(-1);
                        add_cell(row, {
                            sort: new Date(issue.createdAt).getTime(),
                            text: print_date(issue.createdAt)
                        });
                        add_cell(row, {text: print_user(issue.user_issue)});
                        add_cell(row, {text: issue._qty});
                        add_cell(row, {text: issue_statuses[issue._status]});
                        add_cell(row, {append: new Link({
                            href: `/stores/issues/${issue.issue_id}`,
                            small: true
                        }).e});
                    } catch (error) {
                        console.log(error);
                    };
                });
            };
        },
        {
            table: 'issues',
            query: [`size_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getIssues);