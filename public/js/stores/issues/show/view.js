const statuses = {'-3': 'Cancelled (Ordered)', '-2': 'Cancelled (Approved)', '1': 'Requested', '2': 'Approved', '3': 'Ordered', '4': 'Added To Loancard', '5': 'Returned'};
function getIssue() {
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
        set_innerText('issue_order',      issue.order_id);
        set_innerText('issue_createdAt',  print_date(issue.createdAt, true));
        set_innerText('issue_updatedAt',  print_date(issue.updatedAt, true));
        set_innerText('issue_user',       print_user(issue.user));

        clear('tbl_issue_loancard_lines')
        .then(tbl_issue_loancard_lines => {
            issue.loancard_lines.forEach(line => {
                let row = tbl_issue_loancard_lines.insertRow(-1);
                add_cell(row, {text: line.loancard_line_id});
                add_cell(row, {append: new Link(`/loancard_lines/${line.loancard_line_id}`).e});
            });
        });

        set_href('issue_user_link',       `/users/${issue.user_id}`);
        set_href('issue_user_issue_link', `/users/${issue.user_id_issue}`);
        set_href('issue_size_link',       `/sizes/${issue.size_id}`);
        if (issue.order_id) {
            set_href('issue_order_link',  `/orders/${issue.order_id}`);

        } else {
            set_href('issue_order_link');

        };
        set_href('issue_item_link',       `/items/${issue.size.item_id}`);

        if (typeof set_mark_as_options === 'function') set_mark_as_options(issue.status);

        set_status_badges(issue.status);
    })
    .catch(err => {
        alert(err);
        window.location.href = '/issues';
    });
};
function set_status_badges(status) {
    clear_statuses(5, statuses);
    if ([-3, -2, -1, 1, 2, 3, 4, 5].includes(status)) {
        if ([-3, -2, 1, 2, 3, 4, 5].includes(status)) {
            set_badge(1, 'success');
        } else {
            set_badge(1, 'danger', 'Rejected');
        };
        
        if (status === -3 || status >= 2) {
            set_badge(2, 'success');
        } else if (status === -2) {
            set_badge(2, 'danger', 'Cancelled');
        };

        if (status >= 3) {
            set_badge(3, 'success');
        } else if (status === -3) {
            set_badge(3, 'danger', 'Cancelled');
        };

        if (status >= 4) set_badge(4, 'success');
        
        if (status >= 5) set_badge(5, 'success');
    };
};
window.addEventListener('load', function () {
    add_listener('reload', getIssue);
    getIssue();
});