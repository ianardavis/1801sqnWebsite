let issue_statuses = {'0': 'Cancelled', '1': 'Requested', '2': 'Approved', '3': 'Ordered', '4': 'Issued', '5': 'Returned'};
function query() {
    let where = null,
        like  = null,
        gt    = null,
        lt    = null;
    
    let sel_statuses = checked_statuses(),
        sel_user     = selected_user('filter_issues_user');
    if (sel_statuses || sel_user) where = {};
    if (sel_statuses) where.status = sel_statuses;
    if (sel_user) where.user_id_issue = sel_user;

    let date_from = document.querySelector(`#filter_issues_createdAt_from`) || {value: ''},
        date_to   = document.querySelector(`#filter_issues_createdAt_to`)   || {value: ''};
    if (date_from && date_from.value !== '') gt = {column: 'createdAt', value: date_from.value};
    if (date_to   && date_to.value   !== '') lt = {column: 'createdAt', value: date_to  .value};

    let item  = document.querySelector('#filter_issues_item')   || {value: ''},
        size1 = document.querySelector('#filter_issues_size_1') || {value: ''},
        size2 = document.querySelector('#filter_issues_size_2') || {value: ''},
        size3 = document.querySelector('#filter_issues_size_3') || {value: ''};
    if (item.value || size1.value || size2.value || size3.value) like = {};
    if (item .value !=='') like.description = item.value;
    if (size1.value !=='') like.size1       = size1.value;
    if (size2.value !=='') like.size2       = size2.value;
    if (size3.value !=='') like.size3       = size3.value;

    return {
        where: where,
        like:  like,
        gt:    gt,
        lt:    lt
    };
};
function getIssues() {
    clear('tbl_issues')
    .then(tbl_issues => {
        get({
            table: 'issues',
            ...query(),
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
                    issue.status === 0 ||
                    issue.status === 1 ||
                    issue.status === 2 ||
                    issue.status === 3
                ) {
                    if (typeof nil_radio     === 'function') radios.push(nil_radio(    issue.issue_id, row_index));
                };
                if (issue.status === 0) {
                    if (typeof restore_radio === 'function') radios.push(restore_radio(issue.issue_id, row_index));
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
                                    if (typeof nil_radio === 'function') radio_div.insertBefore(nil_radio(issue.issue_id, options.index), details_div);
                                    radio_div.insertBefore(loancard_radio(issue.issue_id, options.index), details_div);
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
function getUsers() {
    return listUsers({
        select:     'filter_issues_user',
        table:      'users',
        append:     '_issue',
        blank:      true,
        blank_text: 'All',
        id_only:    true
    });
};
addReloadListener(getIssues);
sort_listeners(
    'issues',
    getIssues,
    [
        {value: 'createdAt',     text: 'Date', selected: true},
        {value: 'user_id_issue', text: 'User'},
        {value: 'description',   text: 'Description'},
        {value: 'size1',         text: 'Size 1'},
        {value: 'size2',         text: 'Size 2'},
        {value: 'size3',         text: 'Size 3'},
        {value: 'qty',           text: 'Qty'},
        {value: 'status',        text: 'Status'}
    ]
);
getUsers();
window.addEventListener('load', function () {
    addListener('filter_issues_user', getIssues, 'input');
    addListener('status_issues_0', getIssues, 'input');
    addListener('status_issues_1', getIssues, 'input');
    addListener('status_issues_2', getIssues, 'input');
    addListener('status_issues_3', getIssues, 'input');
    addListener('status_issues_4', getIssues, 'input');
    addListener('status_issues_5', getIssues, 'input');
    addListener('filter_issues_createdAt_from', getIssues, 'input');
    addListener('filter_issues_createdAt_to', getIssues, 'input');
    addListener('filter_issues_item', getIssues, 'input');
    addListener('filter_issues_size_1', getIssues, 'input');
    addListener('filter_issues_size_2', getIssues, 'input');
    addListener('filter_issues_size_3', getIssues, 'input');
});
