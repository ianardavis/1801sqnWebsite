let issue_statuses = {'0': 'Cancelled', '1': 'Requested', '2': 'Approved', '3': 'Ordered', '4': 'Issued', '5': 'Returned'};
function stringify_query() {
    let query = {filter: {}, page: {}};
    query.filter.status        = _checked_statuses();
    query.filter.user_id_issue = selected_user('filter_issues_user');
    query.filter.createdAt     = selected_dates('issues');
    query.filter.item = document.querySelector('#filter_issues_item').value;
    query.filter.size = {};
    query.filter.size.size1 = document.querySelector('#filter_issues_size_1').value;
    query.filter.size.size2 = document.querySelector('#filter_issues_size_2').value;
    query.filter.size.size3 = document.querySelector('#filter_issues_size_3').value;
    query.page.limit = document.querySelector('.limit_issues:checked').value
    let offset       = document.querySelector('.offset_issues:checked') || {value: '0'};
    query.page.offset = offset.value;
    query.page.order  = [];
    let sort = [];
    sort.push(document.querySelector('#sort_issues').value);
    sort.push(document.querySelector('#sort_issues_dir').value);
    query.page.order.push(sort);
    return JSON.stringify(query);
};
function getIssues() {
    clear('tbl_issues')
    .then(tbl_issues => {
        get({
            table: 'issues',
            filter: stringify_query()
        })
        .then(function ([result, options]) {
            add_page_links(result.count, result.limit, result.offset, 'issues');
            let row_index = 0;
            result.issues.forEach(issue => {
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
                add_cell(row, {append: new Link({href: `/issues/${issue.issue_id}`, large: true}).e});
                row_index ++;
            });
            hide_spinner('issues');
        });
    });
};
function AddSortColumns() {
    clear('sort_issues')
    .then(sort_issues => {
        clear('sort_issues_dir')
        .then(sort_issues_dir => {
            sort_issues.appendChild(new Option({value: 'createdAt',     text: 'Date', selected: true}).e);
            sort_issues.appendChild(new Option({value: 'user_id_issue', text: 'User'}).e);
            sort_issues.appendChild(new Option({value: 'description',   text: 'Item'}).e);
            sort_issues.appendChild(new Option({value: 'size1',         text: 'Size 1'}).e);
            sort_issues.appendChild(new Option({value: 'size2',         text: 'Size 2'}).e);
            sort_issues.appendChild(new Option({value: 'size3',         text: 'Size 3'}).e);
            sort_issues.appendChild(new Option({value: 'qty',           text: 'Qty'}).e);
            sort_issues.appendChild(new Option({value: 'status',        text: 'Status'}).e);
            sort_issues_dir.appendChild(new Option({value: 'ASC',  text: 'Asc', selected: true}).e);
            sort_issues_dir.appendChild(new Option({value: 'DESC', text: 'Desc'}).e);
        });
    });
    
};
function getUsers() {
    listUsers({
        select:     'filter_issues_user',
        table:      'users',
        append:     '_issue',
        blank:      true,
        blank_text: 'All',
        id_only:    true
    });
};
addReloadListener(getIssues);
window.addEventListener('load', function () {
    addListener('limit_issues_10',  getIssues, 'input');
    addListener('limit_issues_20',  getIssues, 'input');
    addListener('limit_issues_30',  getIssues, 'input');
    addListener('limit_issues_all', getIssues, 'input');
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
    addListener('filter_issues_size_2', getIssues, 'input');
    addListener('sort_issues', getIssues, 'input');
    addListener('sort_issues_dir', getIssues, 'input');
});
