const statuses = {
    '-3': 'Cancelled (Ordered)',
    '-2': 'Cancelled (Approved)',
     '1': 'Requested',
     '2': 'Approved',
     '3': 'Ordered',
     '4': 'Added To Loancard',
     '5': 'Returned'
};
function getIssue() {
    function disable_all_buttons() {
        disable_button('delete');
        disable_button('mark_as');
        for (let i=0; i<=5 ; i++) {
            disable_button(`mark_${i}`);
        };
    };
    function display_details([issue, options]) {
        set_breadcrumb(issue.issue_id);
        set_innerText('issue_user_issue', print_user(issue.user_issue));
        set_innerText('issue_size',       print_size(issue.size));
        set_innerText('issue_item',       issue.size.item.description);
        set_innerText('issue_qty',        issue.qty);
        set_innerText('issue_order',      issue.order_id);
        set_innerText('issue_createdAt',  print_date(issue.createdAt, true));
        set_innerText('issue_updatedAt',  print_date(issue.updatedAt, true));
        set_innerText('issue_user',       print_user(issue.user));
        return issue;
    };
    function set_links(issue) {
        set_href('issue_user_link',       `/users/${issue.user_id}`);
        set_href('issue_user_issue_link', `/users/${issue.user_id_issue}`);
        set_href('issue_size_link',       `/sizes/${issue.size_id}`);
        if (issue.order_id) {
            set_href('issue_order_link',  `/orders/${issue.order_id}`);

        } else {
            set_href('issue_order_link');

        };
        set_href('issue_item_link',       `/items/${issue.size.item_id}`);
        return issue;
    };
    function display_loancard_lines(issue) {
        clear('tbl_issue_loancard_lines')
        .then(tbl_issue_loancard_lines => {
            issue.loancard_lines.forEach(line => {
                let row = tbl_issue_loancard_lines.insertRow(-1);
                add_cell(row, {text: line.loancard_line_id});
                add_cell(row, {append: new Link(`/loancard_lines/${line.loancard_line_id}`).e});
            });
            return issue;
        });
    };
    function set_status_badges(issue) {
        clear_statuses(5, statuses);
        if ([-3, -2, -1, 1, 2, 3, 4, 5].includes(issue.status)) {
            if ([-3, -2, 1, 2, 3, 4, 5].includes(issue.status)) {
                set_badge(1, 'success');
            } else {
                set_badge(1, 'danger', 'Rejected');
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
        return issue;
    };
    function set_button_states(issue) {
        if (typeof set_mark_as_options === 'function') set_mark_as_options(issue.status);
        if (
            typeof enable_delete_button === 'function' &&
            [1, 2, 3].includes(Number(issue.status))
        ) enable_delete_button();
        return issue;
    };

    disable_all_buttons();
    get({
        table: 'issue',
        where: {issue_id: path[2]}
    })
    .then(display_details)
    .then(set_links)
    .then(display_loancard_lines)
    .then(set_status_badges)
    .then(set_button_states)
    .catch(err => redirect_on_error(err, '/issues'));
};
window.addEventListener('load', function () {
    add_listener('reload', getIssue);
    getIssue();
});