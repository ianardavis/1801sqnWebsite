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
        disableButton('delete');
        disableButton('mark_as');
        for (let i=0; i<=5 ; i++) {
            disableButton(`mark_${i}`);
        };
    };
    function display_details([issue, options]) {
        setBreadcrumb(issue.issue_id);
        setInnerText('issue_user_issue', printUser(issue.user_issue));
        setInnerText('issue_size',       printSize(issue.size));
        setInnerText('issue_item',       issue.size.item.description);
        setInnerText('issue_qty',        issue.qty);
        setInnerText('issue_order',      issue.order_id);
        setInnerText('issue_createdAt',  printDate(issue.createdAt, true));
        setInnerText('issue_updatedAt',  printDate(issue.updatedAt, true));
        setInnerText('issue_user',       printUser(issue.user));
        return issue;
    };
    function set_links(issue) {
        setHREF('issue_user_link',       `/users/${issue.user_id}`);
        setHREF('issue_user_issue_link', `/users/${issue.user_id_issue}`);
        setHREF('issue_size_link',       `/sizes/${issue.size_id}`);
        if (issue.order_id) {
            setHREF('issue_order_link',  `/orders/${issue.order_id}`);

        } else {
            setHREF('issue_order_link');

        };
        setHREF('issue_item_link',       `/items/${issue.size.item_id}`);
        return issue;
    };
    function display_loancard_lines(issue) {
        clear('tbl_issue_loancard_lines')
        .then(tbl_issue_loancard_lines => {
            issue.loancard_lines.forEach(line => {
                let row = tbl_issue_loancard_lines.insertRow(-1);
                addCell(row, {text: line.line_id});
                addCell(row, {append: new Link(`/loancard_lines/${line.line_id}`).e});
            });
        });
        return issue;
    };
    function set_status_badges(issue) {
        clearStatuses(5, statuses);
        if ([-3, -2, -1, 1, 2, 3, 4, 5].includes(issue.status)) {
            if ([-3, -2, 1, 2, 3, 4, 5].includes(issue.status)) {
                setBadge(1, 'success');
            } else {
                setBadge(1, 'danger', 'Rejected');
            };
            
            if (issue.status === -3 || issue.status >= 2) {
                setBadge(2, 'success');
            } else if (issue.status === -2) {
                setBadge(2, 'danger', 'Cancelled');
            };
    
            if (issue.status >= 3) {
                setBadge(3, 'success');
            } else if (issue.status === -3) {
                setBadge(3, 'danger', 'Cancelled');
            };
    
            if (issue.status >= 4) setBadge(4, 'success');
            
            if (issue.status >= 5) setBadge(5, 'success');
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
    .catch(err => redirectOnError(err, '/issues'));
};
window.addEventListener('load', function () {
    addListener('reload', getIssue);
    getIssue();
});