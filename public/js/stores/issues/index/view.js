const statuses = {
    '-3': 'Cancelled (Ordered)',
    '-2': 'Cancelled (Approved)',
     '1': 'Requested',
     '2': 'Approved',
     '3': 'Ordered',
     '4': 'Added To Loancard',
     '5': 'Returned'
};
function getIssues() {
    clear('tbl_issues')
    .then(tbl_issues => {
        function add_line(issue, index) {
            let row = tbl_issues.insertRow(-1);
            add_cell(row, table_date(issue.createdAt));
            add_cell(row, {text: print_user(issue.user_issue)});
            add_cell(row, {text: (issue.size && issue.size.item ? issue.size.item.description : '')});
            add_cell(row, {text: print_size(issue.size)});
            add_cell(row, {text: issue.qty});
            add_cell(row, {
                text: statuses[issue.status] || 'Unknown',
                append: new Hidden_Input({
                    attributes: [
                        {field: 'name',  value: `lines[][${index}][issue_id]`},
                        {field: 'value', value: issue.issue_id}
                    ]
                }).e
            });
    
            add_cell(row, {
                id: `row_${issue.issue_id}`,
                append: row_radios(issue, index)
            });
            add_cell(row, {append: new Link(`/issues/${issue.issue_id}`).e});
        };
        get({
            table: 'issues',
            func:  getIssues,
            ...build_filter_query('issue')
        })
        .then(function ([result, options]) {
            let index = 0;
            result.issues.forEach(issue => {
                add_line(issue, index);
                index ++;
            });
            hide_spinner('issues');
        });
    });
};
function row_radios(issue, index) {
    let radios = [];
    const args = [issue.issue_id, index, issue_options];
    if ([0, 1, 2, 3].includes(issue.status)) {
        if (typeof     nil_radio === 'function') radios.push(nil_radio(    ...args));
    };
    if (issue.status === 0) {
        if (typeof restore_radio === 'function') radios.push(restore_radio(...args));
    };
    if (issue.status === 1) {
        if (typeof decline_radio === 'function') radios.push(decline_radio(...args));
        if (typeof approve_radio === 'function') radios.push(approve_radio(...args));
    };
    if (issue.status === 2 || issue.status === 3) {
        if (typeof cancel_radio  === 'function') radios.push(cancel_radio( ...args, '-'+issue.status));
    };
    if (issue.size.orderable && issue.status === 2) {
        if (typeof order_radio   === 'function') radios.push(order_radio(  ...args));
    };
    if (issue.size.issueable && issue.status === 2 || issue.status   === 3) {
        if (typeof issue_radio   === 'function') radios.push(issue_radio(  ...args));
    };
    radios.push(new Div({attributes: [{field: 'id', value: `details_${issue.issue_id}`}]}).e);
    return radios;
};
function get_users() {
    return listCurrentUsers({
        select: 'filter_issue_user',
        blank:  {text: 'All'}
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getIssues);
    get_users();
    sidebarOnShow('IssuesFilter', get_users);
    modalOnShow('issue_add', () => {sidebarClose('IssuesFilter')});
    add_listener('btn_users_reload',            get_users);
    add_listener('filter_issue_user',           getIssues, 'input');
    add_listener('filter_issue_statuses',       getIssues, 'input');
    add_listener('filter_issue_createdAt_from', getIssues, 'input');
    add_listener('filter_issue_createdAt_to',   getIssues, 'input');
    add_listener('filter_issue_item',           getIssues, 'input');
    add_listener('filter_issue_size_1',         getIssues, 'input');
    add_listener('filter_issue_size_2',         getIssues, 'input');
    add_listener('filter_issue_size_3',         getIssues, 'input');
    addFormListener(
        'issue_edit',
        'PUT',
        '/issues',
        {onComplete: getIssues}
    );
    add_sort_listeners('issues', getIssues);
    getIssues();
});
