let issue_statuses = {'0': 'Cancelled', '1': 'Requested', '2': 'Approved', '3': 'Ordered', '4': 'Issued', '5': 'Returned'};
function getIssues() {
    clear('tbl_issues')
    .then(tbl_issues => {
        let query = [
            checked_statuses(),
            selected_user()
        ];
        get({
            table: 'issues',
            query: [query.filter(a => a).join(',')],
            ...pagination(tbl_issues),
            ...sort_query(tbl_issues)
        })
        .then(function ([result, options]) {
            add_page_links(result.count, result.limit, result.offset);
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
            return true;
        })
        .then(result => filter(tbl_issues));
    });
};
function filter(tbl_issues) {
    if (!tbl_issues) tbl_issues = document.querySelector('#tbl_issues');
    let from = new Date(document.querySelector('#createdAt_from').value).getTime() || '',
        to   = new Date(document.querySelector('#createdAt_to')  .value).getTime() || '',
        item = document.querySelector('#item').value.trim() || '',
        size = document.querySelector('#size').value.trim() || '';
    tbl_issues.childNodes.forEach(row => {
        if (
            (!from || row.childNodes[0].dataset.sort > from) &&
            (!to   || row.childNodes[0].dataset.sort < to)   &&
            (!item || row.childNodes[2].innerText.toLowerCase().includes(item.toLowerCase())) &&
            (!size || row.childNodes[3].innerText.toLowerCase().includes(size.toLowerCase()))
        )    row.classList.remove('hidden')
        else row.classList.add(   'hidden');
    });
};
function getUsers() {
    listUsers({
        table:      'users',
        append:     '_issue',
        blank:      true,
        blank_text: 'All'
    });
};
addReloadListener(getIssues);
window.addEventListener('load', function () {
    addListener('reload_users', getUsers);
    addListener('sel_users', getIssues, 'change');
    addListener('status_0',  getIssues, 'change');
    addListener('status_1',  getIssues, 'change');
    addListener('status_2',  getIssues, 'change');
    addListener('status_3',  getIssues, 'change');
    addListener('status_4',  getIssues, 'change');
    addListener('status_5',  getIssues, 'change');
    addListener('limit_10',  getIssues, 'input');
    addListener('limit_20',  getIssues, 'input');
    addListener('limit_30',  getIssues, 'input');
    addListener('limit_all', getIssues, 'input');
    addListener('createdAt_from', function (){filter()}, 'change');
    addListener('createdAt_to',   function (){filter()}, 'change');
    addListener('item',           function (){filter()}, 'input');
    addListener('size',           function (){filter()}, 'input');
});
