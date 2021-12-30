let statuses = {'0': 'Cancelled', '1': 'Requested', '2': 'Approved', '3': 'Ordered', '4': 'Issued', '5': 'Returned'};
function getIssue() {
    disable_button('size_edit');
    get({
        table: 'issue',
        where: {issue_id: path[2]}
    })
    .then(function ([issue, options]) {
        set_breadcrumb(issue.issue_id);
        set_innerText('issue_user_issue', print_user(issue.user_issue));
        set_innerText('issue_size',       print_size(issue.size));
        set_innerText('issue_item',       issue.size.item.description);
        set_innerText('issue_qty',        issue.qty);
        set_innerText('issue_createdAt',  print_date(issue.createdAt, true));
        set_innerText('issue_updatedAt',  print_date(issue.updatedAt, true));
        set_innerText('issue_status',     statuses[issue.status]);
        set_innerText('issue_user',       print_user(issue.user));
        set_href('issue_user_link',       `/users/${issue.user_id}`);
        set_href('issue_user_issue_link', `/users/${issue.user_id_issue}`);
        set_href('issue_size_link',       `/sizes/${issue.size_id}`);
        set_href('issue_item_link',       `/items/${issue.size.item_id}`);
        if (issue.status === 1 || issue.status === 2) {
            enable_button('size_edit');
            set_data('btn_size_edit', 'item_id', issue.size.item_id);
        };
    })
    .catch(err => window.location.href = '/issues');
};
addReloadListener(getIssue);
window.addEventListener('load', function () {
    addFormListener(
        'mark_cancelled',
        'PUT',
        `/issues/${path[2]}/mark/0`,
        {onComplete: [
            getIssue,
            getActions
        ]}
    );
    addFormListener(
        'mark_requested',
        'PUT',
        `/issues/${path[2]}/mark/1`,
        {onComplete: [
            getIssue,
            getActions
        ]}
    );
    addFormListener(
        'mark_approved',
        'PUT',
        `/issues/${path[2]}/mark/2`,
        {onComplete: [
            getIssue,
            getActions
        ]}
    );
    addFormListener(
        'mark_ordered',
        'PUT',
        `/issues/${path[2]}/mark/3`,
        {onComplete: [
            getIssue,
            getActions
        ]}
    );
    addFormListener(
        'mark_issued',
        'PUT',
        `/issues/${path[2]}/mark/4`,
        {onComplete: [
            getIssue,
            getActions
        ]}
    );
    addFormListener(
        'mark_returned',
        'PUT',
        `/issues/${path[2]}/mark/5`,
        {onComplete: [
            getIssue,
            getActions
        ]}
    );
});