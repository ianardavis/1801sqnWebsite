let issue_statuses = {'0': 'Cancelled', '1': 'Requested', '2': 'Approved', '3': 'Ordered', '4': 'Issued', '5': 'Returned'};
function getIssues() {
    show_spinner('issues');
    let form = document.querySelector('#form_filter');
    if (form) form.requestSubmit();
    else hide_spinner('issues');
};
function showIssues(result) {
    clear('tbl_issues')
    .then(tbl_issues => {
        add_page_links(result.result.count, result.result.limit, result.result.offset);
        let row_index = 0;
        result.result.issues.forEach(issue => {
            let row = tbl_issues.insertRow(-1);
            add_cell(row, table_date(issue.createdAt));
            add_cell(row, {text: print_user(issue.user_issue)});
            add_cell(row, {text: (issue.size ? (issue.size.item ? issue.size.item.description : '') : '')});
            add_cell(row, {text: (issue.size ? print_size(issue.size) : '')});
            add_cell(row, {text: issue.qty});
            add_cell(row, {
                text: issue_statuses[issue.status] || 'Unknown',
                append: new Input({
                    attributes: [
                        {field: 'type',  value: 'hidden'},
                        {field: 'name',  value: `issues[][${row_index}][issue_id]`},
                        {field: 'value', value: issue.issue_id}
                    ]
                }).e
            });
            let radios = [];
            if (
                issue.status === 1 ||
                issue.status === 2 ||
                issue.status === 3
            ) {
                if (typeof nil_radio     === 'function') radios.push(nil_radio(    issue.issue_id, row_index));
            };
            if (issue.status === 1) {
                if (typeof decline_radio === 'function') radios.push(decline_radio(issue.issue_id, row_index));
                if (typeof approve_radio === 'function') radios.push(approve_radio(issue.issue_id, row_index));
            };
            if (issue.status === 2 || issue.status === 3) {
                if (typeof cancel_radio  === 'function') radios.push(cancel_radio( issue.issue_id, row_index));
            };
            if (issue.status === 2) {
                if (typeof order_radio   === 'function') radios.push(order_radio(  issue.issue_id, row_index));
            };
            if (issue.status === 2 || issue.status === 3) {
                if (typeof issue_radio   === 'function') radios.push(issue_radio(  issue.issue_id, row_index));
            };
            let div = new Div({attributes: [{field: 'id', value: `${issue.issue_id}_details`}]}).e;
            if (issue.status === 4 ) {
                if (typeof loancard_radio === 'function') {
                    get({
                        table: 'issue_loancard',
                        query: [`"issue_id":"${issue.issue_id}"`],
                        index: row_index
                    })
                    .then(function ([loancard_line, options]) {
                        if (loancard_line.status === 1) {
                            let radio_div   = tbl_issues.querySelector(`#${issue.issue_id}_row`),
                                details_div = tbl_issues.querySelector(`#${issue.issue_id}_details`);
                            if (radio_div) {
                                if (typeof nil_radio === 'function') radio_div.insertBefore(nil_radio(issue.issue_id, options.index), details_div);
                                radio_div.insertBefore(loancard_radio(issue.issue_id, options.index), details_div);
                            };
                        };
                    });
                };
            };
            radios.push(div);
            add_cell(row, {
                id: `${issue.issue_id}_row`,
                append: radios
            });
            add_cell(row, {append: new Link({href: `/issues/${issue.issue_id}`}).e});
            row_index ++;
        });
        hide_spinner('issues');
    });
};
function getUsers() {
    listUsers({
        select:     'filter_user',
        table:      'users',
        append:     '_issue',
        blank:      true,
        blank_text: 'All',
        id_only: true
    });
};
addReloadListener(getIssues);
window.addEventListener('load', function () {
    addListener('limit_10',  getIssues, 'input');
    addListener('limit_20',  getIssues, 'input');
    addListener('limit_30',  getIssues, 'input');
    addListener('limit_all', getIssues, 'input');
    addFormListener(
        'filter',
        'POST',
        '/get/issues',
        {
            spinner:        'issues',
            noConfirm:      true,
            noConfirmAlert: true,
            onComplete: showIssues
        }
    )
});
