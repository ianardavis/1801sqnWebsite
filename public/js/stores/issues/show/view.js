let statuses = {'0': 'Cancelled', '1': 'Requested', '2': 'Approved', '3': 'Ordered', '4': 'Issued', '5': 'Returned'};
function getIssue() {
    get({
        table: 'issue',
        query: [`"issue_id":"${path[2]}"`]
    })
    .then(function ([issue, options]) {
        set_innerText({id: `issue_user_issue`,      text: print_user(issue.user_issue)});
        set_attribute({id: `issue_user_issue_link`, attribute: 'href', value: `/users/${issue.user_id_issue}`});
        set_innerText({id: 'issue_size',            text: print_size(issue.size)});
        set_attribute({id: 'issue_size_link',       attribute: 'href', value: `/sizes/${issue.size_id}`});
        set_innerText({id: 'issue_item',            text: issue.size.item.description});
        set_attribute({id: 'issue_item_link',       attribute: 'href', value: `/items/${issue.size.item_id}`});
        set_innerText({id: 'issue_qty',             text: issue.qty});
        set_innerText({id: 'issue_createdAt',       text: print_date(issue.createdAt, true)});
        set_innerText({id: 'issue_updatedAt',       text: print_date(issue.updatedAt, true)});
        set_innerText({id: 'issue_status',          text: statuses[issue.status]});
        set_innerText({id: 'issue_user',            text: print_user(issue.user)});
        set_attribute({id: 'issue_user_link',       attribute: 'href', value: `/users/${issue.user_id}`});
        set_breadcrumb({text: issue.issue_id});
        set_attribute({id: 'issue_size_edit', attribute: 'data-item_id', value: issue.size.item_id});
    })
    .catch(err => window.location.href = '/issues');
};
addReloadListener(getIssue);