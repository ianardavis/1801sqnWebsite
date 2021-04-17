function getIssues(status) {
    let tbl = document.querySelector(`#tbl_issues_${status}`);
    if (tbl) {
        tbl.innerHTML = '';
        let sel_filter_users = document.querySelector('#sel_filter_users') || {value: ''};
        get(
            {
                table: 'issues',
                query: [`_status=${status}`, sel_filter_users.value],
                spinner: `status_${status}`
            },
            function (issues, options) {
                set_count({id: `status_${status}`, count: issues.length || 0});
                issues.forEach(issue => {
                    let row = tbl.insertRow(-1);
                    add_cell(row, table_date(issue.createdAt));
                    add_cell(row, {text: print_user(issue.user_issue)});
                    add_cell(row, {text: issue.size.item._description});
                    add_cell(row, {text: issue.size._size});
                    add_cell(row, {text: issue._qty});
                    if (['1', '2', '3'].includes(status)) {
                        let div = new Div().e;
                        div.appendChild(new Select({
                            small: true,
                            options: [new Option({text: '... Select', selected: true}).e],
                            attributes: [
                                {field: 'name', value: `lines[${issue.issue_id}][_status]`},
                                {field: 'id'  , value: `sel_action_${issue.issue_id}`}
                            ]
                        }).e);
                        div.appendChild(new Hidden({
                            attributes: [
                                {field: 'name',  value: `lines[${issue.issue_id}][issue_id]`},
                                {field: 'value', value: issue.issue_id}
                            ]
                        }).e)
                        add_cell(row, {
                            append: div,
                            classes: [`actions-${status}`],
                            data: {
                                field: 'id',
                                value: issue.issue_id
                            }
                        });
                    };
                    add_cell(row, {append: new Link({href: `/issues/${issue.issue_id}`, small: true}).e});
                });
                if (status === '1' && typeof getRequestedActions === 'function') getRequestedActions();
                if (
                    (status === '2' || status === '3') &&
                    typeof getIssueActions === 'function'
                ) getIssueActions(status);
                if (status === '2' && typeof getOrderActions === 'function') getOrderActions();
            }
        );
    };
};
function getUsers() {
    listUsers({
        select:    'sel_users',
        table:     'users',
        blank:     true,
        blank_opt: {text: 'All', selected: true},
        onComplete: loadAll()
    });
};
function loadAll() {
    getIssues('0');
    getIssues('1');
    getIssues('2');
    getIssues('3');
    getIssues('4');
    getIssues('5');
};
window.addEventListener('load', function () {
    addFormListener(
        'lines_2',
        'PUT',
        '/issues',
        {onComplete: loadAll}
    );
    addFormListener(
        'lines_3',
        'PUT',
        '/issues',
        {onComplete: loadAll}
    );
    document.querySelector('#reload_users').addEventListener('click',  getUsers);
    document.querySelector('#reload')      .addEventListener('click',  loadAll);
    document.querySelector('#sel_users')   .addEventListener('change', loadAll);
});