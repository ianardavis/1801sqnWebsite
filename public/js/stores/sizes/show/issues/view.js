let issue_statuses = {'0': 'Cancelled', '1': 'Requested', '2': 'Approved', '3': 'Ordered', '4': 'Issued', '5': 'Returned'};
function getIssues() {
    clear_table('issues')
    .then(tbl_issues => {
        let status = document.querySelector('#sel_issue_status') || {value: ''}
        get({
            table: 'issues',
            query: [`size_id=${path[2]}`, status.value]
        })
        .then(function ([issues, options]) {
            set_count({id: 'issue', count: issues.length});
            issues.forEach(issue => {
                try {
                    let row = tbl_issues.insertRow(-1);
                    add_cell(row, table_date(issue.createdAt));
                    add_cell(row, {text: print_user(issue.user_issue)});
                    add_cell(row, {text: issue.qty});
                    add_cell(row, {text: issue_statuses[issue.status]});
                    add_cell(row, {append: new Button({
                        modal: 'issue_view',
                        data: {field: 'id', value: issue.issue_id},
                        small: true
                    }).e});
                } catch (error) {
                    console.log(error);
                };
            });
        });
    })
    .catch(err => console.log(err));
};
function viewIssue(issue_id) {
    get({
        table: 'issue',
        query: [`issue_id=${issue_id}`],
        spinner: 'issue_view'
    })
    .then(function ([issue, options]){

        set_innerText({id: 'issue_user_to',   text: print_user(issue.user_issue)});
        set_innerText({id: 'issue_user_by',   text: print_user(issue.user)});
        set_innerText({id: 'issue_qty',       text: issue.qty});
        set_innerText({id: 'issue_status',    text: issue_statuses[issue.status]});
        set_innerText({id: 'issue_createdAt', text: print_date(issue.createdAt)});
        set_innerText({id: 'issue_updatedAt', text: print_date(issue.updatedAt)});
        set_innerText({id: 'issue_id',        text: issue.issue_id});
        set_href({id: 'btn_issue_link', value: `/issues/${issue.issue_id}`});
        set_href({id: 'issue_user_to_link', value: `/users/${issue.user_id_issue}`});
        set_href({id: 'issue_user_by_link', value: `/users/${issue.user_id}`});
    })
    .catch(err => console.log(err));
};
addReloadListener(getIssues);
window.addEventListener('load', function () {
    document.querySelector('#sel_issue_status').addEventListener('change', getIssues);
    $('#mdl_issue_view').on('show.bs.modal', function (event) {viewIssue(event.relatedTarget.dataset.id)});
});