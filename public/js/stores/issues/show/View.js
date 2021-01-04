function getIssue() {
    let statuses = {'0': 'Cancelled', '1': 'Draft', '2': 'Open', '3': 'Closed'};
    get(
        function (issue, options) {
            set_innerText({id: 'user_issue', text: print_user(issue.user_issue)});
            set_innerText({id: 'user',       text: print_user(issue.user)});
            set_attribute({id: 'user_issue_link', attribute: 'href', value: `/stores/users/${issue.user_id_issue}`});
            set_attribute({id: 'user_link',       attribute: 'href', value: `/stores/users/${issue.user_id}`});
            set_innerText({id: 'createdAt',  text: print_date(issue.createdAt, true)});
            set_innerText({id: 'updatedAt',  text: print_date(issue.updatedAt, true)});
            set_innerText({id: '_date_due',  text: print_date(issue._date_due)});
            set_innerText({id: '_status',    text: statuses[issue._status]});
            set_breadcrumb({
                text: issue.issue_id,
                href: `/stores/issues/${issue.ssue_id}`
            });
        },
        {
            table: 'issue',
            query: [`issue_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getIssue);