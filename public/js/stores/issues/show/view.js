const statuses = {0: 'Cancelled', 1: 'Requested', 2: 'Approved', 3: 'Ordered', 4: 'Added To Loancard', 5: 'Returned'};
function getIssue() {
    disable_button('size_edit');
    disable_button('qty_edit');
    disable_button('mark_as');
    for (let i=0; i<=5 ; i++) {
        disable_button(`mark_${i}`);
    };
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
        set_innerText('issue_user',       print_user(issue.user));
        set_href('issue_user_link',       `/users/${issue.user_id}`);
        set_href('issue_user_issue_link', `/users/${issue.user_id_issue}`);
        set_href('issue_size_link',       `/sizes/${issue.size_id}`);
        set_href('issue_item_link',       `/items/${issue.size.item_id}`);
        if (typeof enable_edit === 'function') enable_edit(issue);

        clear_statuses(5, statuses);
        if ([-3, -2, -1, 1, 2, 3, 4, 5].includes(issue.status)) {
            if ([-3, -2, 1, 2, 3, 4, 5].includes(issue.status)) {
                set_badge(1, 'success');
            } else {
                set_badge(1, 'danger', 'Declined');
            };
            
            if (issue.status === -3 || issue.status >= 2) {
                set_badge(2, 'success');
            } else if (issue.status === -2) {
                set_badge(2, 'danger', 'Cancelled');
            };

            if (issue.status >= 3) {
                set_badge(3, 'success');
            } else if (issue.status === -3) {
                set_badge(3, 'danger', 'Cancelled');
            };

            if (issue.status >= 4) set_badge(4, 'success');
            
            if (issue.status >= 5) set_badge(5, 'success');
        };
    })
    .catch(err => {
        alert(err);
        window.location.href = '/issues';
    });
};
window.addEventListener('load', function () {
    addListener('reload', getIssue);
    getIssue();
});