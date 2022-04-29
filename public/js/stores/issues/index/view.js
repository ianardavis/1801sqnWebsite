let issue_statuses = {0: 'Cancelled', 1: 'Requested', 2: 'Approved', 3: 'Ordered', 4: 'Issued', 5: 'Returned'};
function getIssues() {
    clear('tbl_issues')
    .then(tbl_issues => {
        get({
            table: 'issues',
            ...build_filter_query('issues'),
            func: getIssues
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
                    append: new Hidden({
                        attributes: [
                            {field: 'name',  value: `lines[][${row_index}][issue_id]`},
                            {field: 'value', value: issue.issue_id}
                        ]
                    }).e
                });
                let radios = [], args = [issue.issue_id, row_index, issue_options];
                if (
                    issue.status === 0 ||
                    issue.status === 1 ||
                    issue.status === 2 ||
                    issue.status === 3
                ) {
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
                                let radio_div   = tbl_issues.querySelector(`#${issue.issue_id}_row`),
                                    details_div = tbl_issues.querySelector(`#${issue.issue_id}_details`);
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
                radios.push(new Div({attributes: [{field: 'id', value: `${issue.issue_id}_details`}]}).e);
                add_cell(row, {
                    id: `${issue.issue_id}_row`,
                    append: radios
                });
                add_cell(row, {append: new Link({href: `/issues/${issue.issue_id}`}).e});
                row_index ++;
            });
            hide_spinner('issues');
        });
    });
};
// function getUsers() {
//     return listUsers({
//         select: 'filter_issues_user',
//         blank:  {text: 'All'}
//     });
// };
addReloadListener(getIssues);
sort_listeners(
    'issues',
    getIssues,
    [
        {value: '["createdAt"]',                 text: 'Date', selected: true},
        {value: '["user_issue","surname"]',      text: 'User Surname'},
        {value: '["size","item","description"]', text: 'Description'},
        {value: '["size","size1"]',              text: 'Size 1'},
        {value: '["size","size2"]',              text: 'Size 2'},
        {value: '["size","size3"]',              text: 'Size 3'},
        {value: '["qty"]',                       text: 'Qty'},
        {value: '["status"]',                    text: 'Status'}
    ]
);
// getUsers();
listUsers({
    select: 'filter_issues_user',
    blank:  {text: 'All'}
});
window.addEventListener('load', function () {
    addListener('filter_issues_user',           getIssues, 'input');
    addListener('status_issues_0',              getIssues, 'input');
    addListener('status_issues_1',              getIssues, 'input');
    addListener('status_issues_2',              getIssues, 'input');
    addListener('status_issues_3',              getIssues, 'input');
    addListener('status_issues_4',              getIssues, 'input');
    addListener('status_issues_5',              getIssues, 'input');
    addListener('filter_issues_createdAt_from', getIssues, 'input');
    addListener('filter_issues_createdAt_to',   getIssues, 'input');
    addListener('filter_issues_item',           getIssues, 'input');
    addListener('filter_issues_size_1',         getIssues, 'input');
    addListener('filter_issues_size_2',         getIssues, 'input');
    addListener('filter_issues_size_3',         getIssues, 'input');
    addFormListener(
        'issue_edit',
        'PUT',
        '/issues',
        {onComplete: getIssues}
    );
});
