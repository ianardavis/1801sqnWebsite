const statuses = {
    '-3': 'Cancelled (Ordered)',
    '-2': 'Cancelled (Approved)',
     '1': 'Requested',
     '2': 'Approved',
     '3': 'Ordered',
     '4': 'Added To Loancard',
     '5': 'Returned'
};
function get_issues() {
    Promise.all([
        clear('tbl_issues'),
        filterStatus('issue')
    ])
    
    .then(([tbl_issues, filterStatuses]) => {
        function row_radios(issue, index) {
            let radios = [];
            const args = [issue.issue_id, index, issue_options];
            if ([0, 1, 2, 3].includes(issue.status)) {
                if (typeof     nil_radio === 'function') radios.push(nil_radio(    ...args));
            };
            if (issue.status === 0) {
                if (typeof restore_radio === 'function') radios.push(restore_radio(...args));
            };
            if (issue.status === 1) {
                if (typeof decline_radio === 'function') radios.push(decline_radio(...args));
                if (typeof approve_radio === 'function') radios.push(approve_radio(...args));
            };
            if (issue.status === 2 || issue.status === 3) {
                if (typeof cancel_radio  === 'function') radios.push(cancel_radio( ...args, '-'+issue.status));
            };
            if (issue.size.orderable && issue.status === 2) {
                if (typeof order_radio   === 'function') radios.push(order_radio(  ...args));
            };
            if (issue.size.issueable && issue.status === 2 || issue.status   === 3) {
                if (typeof issue_radio   === 'function') radios.push(issue_radio(  ...args));
            };
            radios.push(new Div({attributes: [{field: 'id', value: `details_${issue.issue_id}`}]}).e);
            return radios;
        };
        function add_line(issue, index) {
            let row = tbl_issues.insertRow(-1);
            addCell(row, tableDate(issue.createdAt));
            addCell(row, {text: printUser(issue.user_issue)});
            addCell(row, {text: (issue.size && issue.size.item ? issue.size.item.description : '')});
            addCell(row, {text: printSize(issue.size)});
            addCell(row, {text: issue.qty});
            addCell(row, {
                text: statuses[issue.status] || 'Unknown',
                append: new Hidden_Input({
                    attributes: [
                        {field: 'name',  value: `lines[][${index}][issue_id]`},
                        {field: 'value', value: issue.issue_id}
                    ]
                }).e
            });
    
            addCell(row, {
                id: `row_${issue.issue_id}`,
                append: row_radios(issue, index)
            });
            addCell(row, {append: new Link(`/issues/${issue.issue_id}`).e});
        };
        get({
            table: 'issues',
            func:  get_issues,
            where: {
                ...filterStatuses,
                ...filterUser('issue')
            },
            like: {
                ...filterItem('issue'),
                ...filterSize('issue')
            },
            gt: filterDateFrom('issue'),
            lt: filterDateTo('issue')
        })
        .then(function ([result, options]) {
            let index = 0;
            result.issues.forEach(issue => {
                add_line(issue, index);
                index ++;
            });
            hideSpinner('issues');
        });
    });
};
function get_users() {
    return listCurrentUsers({
        select: 'filter_issue_user',
        blank:  {text: 'All'}
    });
};
window.addEventListener('load', function () {
    setStatusFilterOptions('issue', [
        {value: '-3', text: 'Cancelled (Ordered)'},
        {value: '-2', text: 'Cancelled (Approved)'},
        {value: '-1', text: 'Declined'},
        {value: '1', text: 'Requested', selected: true},
        {value: '2', text: 'Approved', selected: true},
        {value: '3', text: 'Ordered', selected: true},
        {value: '4', text: 'Added to Loancard'},
        {value: '5', text: 'Returned'}
    ]);
    addListener('reload', get_issues);
    get_users();
    sidebarOnShow('IssuesFilter', get_users);
    modalOnShow('issue_add', () => {sidebarClose('IssuesFilter')});
    addListener('btn_users_reload',            get_users);
    addListener('filter_issue_user',           get_issues, 'input');
    addListener('filter_issue_status',       get_issues, 'input');
    addListener('filter_issue_createdAt_from', get_issues, 'input');
    addListener('filter_issue_createdAt_to',   get_issues, 'input');
    addListener('filter_issue_item',           get_issues, 'input');
    addListener('filter_issue_size_1',         get_issues, 'input');
    addListener('filter_issue_size_2',         get_issues, 'input');
    addListener('filter_issue_size_3',         get_issues, 'input');
    addFormListener(
        'issue_edit',
        'PUT',
        '/issues',
        {onComplete: get_issues}
    );
    addSortListeners('issues', get_issues);
    get_issues();
});
