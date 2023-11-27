let issue_statuses = {'0': 'Cancelled', '1': 'Requested', '2': 'Approved', '3': 'Ordered', '4': 'Issued', '5': 'Returned'};
function get_issues () {
    clear('tbl_issues')
    .then(tbl_issues => {
        let where = {user_id_issue: path[2]},
            statuses = getSelectedOptions('sel_issue_statuses');
        if (statuses.length > 0) where.status = statuses;
        get({
            table: 'issues',
            where: where,
            func: get_issues
        })
        .then(function ([result, options]) {
            let row_index = 0;
            setCount('issue', result.count);
            result.issues.forEach(issue => {
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
                add_cell(row, {append: new Link(`/issues/${issue.issue_id}`).e});
                row_index ++;
            });
            if (typeof addEditSelect === 'function') addEditSelect();
            return tbl_issues;
        })
        .then(tbl_issues => filter(tbl_issues));
    })
    .catch(err => console.error(err));
};
function filter(tbl_issues) {
    if (!tbl_issues) tbl_issues = document.querySelector('#tbl_issues');
    let from = new Date(document.querySelector('#issue_createdAt_from').value).getTime() || '',
        to   = new Date(document.querySelector('#issue_createdAt_to').value)  .getTime() || '',
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
window.addEventListener('load', function () {
    add_listener('reload', get_issues);
    add_listener('sel_issue_statuses', get_issues, 'change');
    add_listener('issue_createdAt_from', function (){filter()}, 'change');
    add_listener('issue_createdAt_to',   function (){filter()}, 'change');
    add_listener('item',           function (){filter()}, 'input');
    add_listener('size',           function (){filter()}, 'input');
    add_sort_listeners('issues', get_issues);
    get_issues();
});