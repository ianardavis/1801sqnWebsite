let issue_statuses = {0: 'Cancelled', 1: 'Requested', 2: 'Approved', 3: 'Ordered', 4: 'Issued', 5: 'Returned'};
function getIssues() {
    clear('tbl_issues')
    .then(tbl_issues => {
        get({
            table: 'issues',
            ...build_filter_query('issue'),
            func:  getIssues
        })
        .then(function ([result, options]) {
            let row_index = 0;
            result.issues.forEach(issue => {
                let row = tbl_issues.insertRow(-1);
                add_cell(row, table_date(issue.createdAt));
                add_cell(row, {text: print_user(issue.user_issue)});
                add_cell(row, {text: (issue.size && issue.size.item ? issue.size.item.description : '')});
                add_cell(row, {text: (issue.size ? print_size(issue.size) : '')});
                add_cell(row, {text: issue.qty});
                add_cell(row, {
                    text: issue_statuses[issue.status] || 'Unknown',
                    append: new Hidden_Input({
                        attributes: [
                            {field: 'name',  value: `lines[][${row_index}][issue_id]`},
                            {field: 'value', value: issue.issue_id}
                        ]
                    }).e
                });
                let radios = [], args = [issue.issue_id, row_index, issue_options];
                if ([0, 1, 2, 3].includes(issue.status)) {
                    if (typeof nil_radio     === 'function') radios.push(nil_radio(    ...args));
                };
                if (issue.status === 0) {
                    if (typeof restore_radio === 'function') radios.push(restore_radio(...args));
                };
                if (issue.status === 1) {
                    if (typeof decline_radio === 'function') radios.push(decline_radio(...args));
                    if (typeof approve_radio === 'function') radios.push(approve_radio(...args));
                };
                if (issue.status === 2 || issue.status === 3) {
                    if (typeof cancel_radio  === 'function') radios.push(cancel_radio( ...args));
                };
                if (issue.status === 2) {
                    if (typeof order_radio   === 'function') radios.push(order_radio(  ...args));
                };
                if (issue.status === 2 || issue.status === 3) {
                    if (typeof issue_radio   === 'function') radios.push(issue_radio(  ...args));
                };
                if (issue.status === 4 ) {
                    if (typeof loancard_radio === 'function') {
                        get({
                            table: 'issue_loancard',
                            where: {issue_id: issue.issue_id},
                            index: row_index
                        })
                        .then(function ([loancard_line, options]) {
                            if (loancard_line.status === 1) {
                                let radio_div   = tbl_issues.querySelector(`#row_${issue.issue_id}`),
                                    details_div = tbl_issues.querySelector(`#details_${issue.issue_id}`);
                                if (radio_div) {
                                    if (typeof nil_radio === 'function') {
                                        radio_div.insertBefore(nil_radio(...args), details_div);
                                    };
                                    radio_div.insertBefore(loancard_radio(...args), details_div);
                                };
                            };
                        });
                    };
                };
                radios.push(new Div({attributes: [{field: 'id', value: `details_${issue.issue_id}`}]}).e);
                add_cell(row, {
                    id: `row_${issue.issue_id}`,
                    append: radios
                });
                add_cell(row, {append: new Link(`/issues/${issue.issue_id}`).e});
                row_index ++;
            });
            hide_spinner('issues');
        });
    });
};
function getUsers() {
    return listUsers({
        select: 'filter_issue_user',
        blank:  {text: 'All'}
    });
};
addReloadListener(getIssues);
window.addEventListener('load', function () {
    getUsers();
    sidebarOnShow('IssuesFilter', getUsers);
    modalOnShow('issue_add', () => {sidebarClose('IssuesFilter')});
    addListener('filter_issue_user',           getIssues, 'input');
    addListener('filter_issue_statuses',       getIssues, 'input');
    addListener('filter_issue_createdAt_from', getIssues, 'input');
    addListener('filter_issue_createdAt_to',   getIssues, 'input');
    addListener('filter_issue_item',           getIssues, 'input');
    addListener('filter_issue_size_1',         getIssues, 'input');
    addListener('filter_issue_size_2',         getIssues, 'input');
    addListener('filter_issue_size_3',         getIssues, 'input');
    addFormListener(
        'issue_edit',
        'PUT',
        '/issues',
        {onComplete: getIssues}
    );
    add_sort_listeners('issues', getIssues);
    getIssues();
});
