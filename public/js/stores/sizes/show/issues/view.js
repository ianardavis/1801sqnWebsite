let issue_statuses = {
    '0': 'Cancelled', 
    '1': 'Requested', 
    '2': 'Approved', 
    '3': 'Ordered', 
    '4': 'Issued', 
    '5': 'Returned'
};
function get_issues() {
    Promise.all([
        clear('tbl_issues'),
        filterStatus('issue')
    ])
    .then(([tbl_issues, filterStatuses]) => {
        function add_line(issue) {
            try {
                let row = tbl_issues.insertRow(-1);
                addCell(row, tableDate(issue.createdAt));
                addCell(row, {text: printUser(issue.user_issue)});
                addCell(row, {text: issue.qty});
                addCell(row, {text: issue_statuses[issue.status]});
                addCell(row, {append: new Modal_Button(
                    _search(),
                    'issue_view',
                    [{field: 'id', value: issue.issue_id}]
                ).e});
            } catch (error) {
                console.error(error);
            };
        };

        get({
            table: 'issues',
            where: {
                size_id: path[2],
                ...filterStatuses
            },
            func: get_issues
        })
        .then(function ([result, options]) {
            setCount('issue', result.count);
            result.issues.forEach(issue => add_line(issue));
        });
    });
};
function viewIssue(issue_id) {
    function display_details([issue, options]) {
        setInnerText('issue_user_to',   printUser(issue.user_issue));
        setInnerText('issue_user_by',   printUser(issue.user));
        setInnerText('issue_qty',       issue.qty);
        setInnerText('issue_status',    issue_statuses[issue.status]);
        setInnerText('issue_createdAt', printDate(issue.createdAt));
        setInnerText('issue_updatedAt', printDate(issue.updatedAt));
        setInnerText('issue_id',        issue.issue_id);
        return issue;
    };
    function set_links(issue) {
        setHREF('btn_issue_link',     `/issues/${issue.issue_id}`);
        setHREF('issue_user_to_link', `/users/${issue.user_id_issue}`);
        setHREF('issue_user_by_link', `/users/${issue.user_id}`);
        return issue;
    };
    get({
        table: 'issue',
        where: {issue_id: issue_id}
    })
    .then(display_details)
    .then(set_links)
    .catch(err => console.error(err));
};
window.addEventListener('load', function () {
    setStatusFilterOptions('issue', [
        {value: '0', text: 'Cancelled'},
        {value: '1', text: 'Requested', selected: true},
        {value: '2', text: 'Approved',  selected: true},
        {value: '3', text: 'Ordered',   selected: true},
        {value: '4', text: 'Issued',    selected: true},
        {value: '5', text: 'Returned'}
    ]);

    addListener('reload', get_issues);
    addListener('filter_issue_status', get_issues,'change');
    modalOnShow('issue_view', function (event) {viewIssue(event.relatedTarget.dataset.id)});
    addSortListeners('issues', get_issues);
    get_issues();
});