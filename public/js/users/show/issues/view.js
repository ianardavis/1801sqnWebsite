let issue_statuses = {'0': 'Cancelled', '1': 'Requested', '2': 'Approved', '3': 'Ordered', '4': 'Issued', '5': 'Returned'};
function getIssues () {
    clear('tbl_issues')
    .then(tbl_issues => {
        let statuses  = document.querySelectorAll("input[type='checkbox']:checked") || [],
            query     = [`"user_id_issue":"${path[2]}"`],
            sort_cols = tbl_issues.parentNode.querySelector('.sort') || null;
        if (statuses && statuses.length > 0) query.push(status_query(statuses));
        get({
            table: 'issues',
            query: [query.join('&')],
            ...sort_query(sort_cols)
        })
        .then(function ([issues, options]) {
            let row_index = 0;
            set_count({id: 'issue', count: issues.length || '0'});
            issues.forEach(issue => {
                let row = tbl_issues.insertRow(-1);
                add_cell(row, table_date(issue.createdAt));
                add_cell(row, {text: (issue.size ? (issue.size.item ? issue.size.item.description : '') : '')});
                add_cell(row, {text: (issue.size ? print_size(issue.size) : '')});
                add_cell(row, {text: issue.qty});
                add_cell(row, {
                    text: issue_statuses[issue.status] || 'Unknown',
                    ...(
                        [1, 2, 3].includes(issue.status) ?
                        {
                            classes: ['actions'],
                            data:    [
                                {field: 'id',    value: issue.issue_id},
                                {field: 'index', value: row_index}
                            ]
                        } : {}
                    )
                });
                add_cell(row, {
                    append: new Link({
                        href: `/issues/${issue.issue_id}`,
                        small: true
                    }).e
                });
                row_index ++;
            });
            if (typeof addEditSelect === 'function') addEditSelect();
            return tbl_issues;
        })
        .then(tbl_issues => filter(tbl_issues));
    })
    .catch(err => console.log(err));
};
function filter(tbl_issues) {
    if (!tbl_issues) tbl_issues = document.querySelector('#tbl_issues');
    let from = new Date(document.querySelector('#createdAt_from').value).getTime() || '',
        to   = new Date(document.querySelector('#createdAt_to').value)  .getTime() || '',
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
addReloadListener(getIssues);
window.addEventListener('load', function () {
    addListener('sel_status_issues', getIssues, 'change');
    addListener('status_0',          getIssues, 'change');
    addListener('status_1',          getIssues, 'change');
    addListener('status_2',          getIssues, 'change');
    addListener('status_3',          getIssues, 'change');
    addListener('status_4',          getIssues, 'change');
    addListener('status_5',          getIssues, 'change');
    addListener('createdAt_from', function (){filter()}, 'change');
    addListener('createdAt_to',   function (){filter()}, 'change');
    addListener('item',           function (){filter()}, 'input');
    addListener('size',           function (){filter()}, 'input');
});