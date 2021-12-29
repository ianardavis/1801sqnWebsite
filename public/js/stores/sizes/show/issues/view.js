let issue_statuses = {'0': 'Cancelled', '1': 'Requested', '2': 'Approved', '3': 'Ordered', '4': 'Issued', '5': 'Returned'};
function getIssues() {
    clear('tbl_issues')
    .then(tbl_issues => {
        let status = document.querySelector('#sel_issue_status') || {value: ''},
            where = {size_id: path[2]};
        if (status.value !== '') where.status = status.value;
        get({
            table: 'issues',
            where: where,
            func: getIssues
        })
        .then(function ([result, options]) {
            set_count('issue', result.count);
            result.issues.forEach(issue => {
                try {
                    let row = tbl_issues.insertRow(-1);
                    add_cell(row, table_date(issue.createdAt));
                    add_cell(row, {text: print_user(issue.user_issue)});
                    add_cell(row, {text: issue.qty});
                    add_cell(row, {text: issue_statuses[issue.status]});
                    add_cell(row, {append: new Button({
                        modal: 'issue_view',
                        data: [{field: 'id', value: issue.issue_id}],
                        small: true
                    }).e});
                } catch (error) {
                    console.log(error);
                };
            });
        });
    });
};
function viewIssue(issue_id) {
    get({
        table: 'issue',
        where: {issue_id: issue_id},
        spinner: 'issue_view'
    })
    .then(function ([issue, options]){
        set_innerText('issue_user_to',   print_user(issue.user_issue));
        set_innerText('issue_user_by',   print_user(issue.user));
        set_innerText('issue_qty',       issue.qty);
        set_innerText('issue_status',    issue_statuses[issue.status]);
        set_innerText('issue_createdAt', print_date(issue.createdAt));
        set_innerText('issue_updatedAt', print_date(issue.updatedAt));
        set_innerText('issue_id',        issue.issue_id);
        set_href('btn_issue_link',     `/issues/${issue.issue_id}`);
        set_href('issue_user_to_link', `/users/${issue.user_id_issue}`);
        set_href('issue_user_by_link', `/users/${issue.user_id}`);
    })
    .catch(err => console.log(err));
};
addReloadListener(getIssues);
sort_listeners(
    'issues',
    getIssues,
    [
        {value: '["createdAt"]',     text: 'Created'},
        {value: '["user_id_issue"]', text: 'Issued To', selected: true},
        {value: '["qty"]',           text: 'Qty'},
        {value: '["status"]',        text: 'Status'}
    ]
);
window.addEventListener('load', function () {
    document.querySelector('#sel_issue_status').addEventListener('change', getIssues);
    modalOnShow('issue_view', function (event) {viewIssue(event.relatedTarget.dataset.id)});
});