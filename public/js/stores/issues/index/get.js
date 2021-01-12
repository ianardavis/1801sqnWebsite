var lines_loaded = {'0': false, '1': false, '2': false, '3': false, '4': false, '5': false};
function getIssues(status) {
    lines_loaded[status] = false;
    get(
        function (issues, options) {
            set_count({id: `status_${status}`, count: issues.length || 0});
            let tbl = document.querySelector(`#tbl_issues_${status}`);
            if (tbl) {
                tbl.innerHTML = '';
                issues.forEach(issue => {
                    let row = tbl.insertRow(-1);
                    add_cell(row, {
                        sort: print_date(issue.createdAt),
                        text: new Date(issue.createdAt).toDateString()
                    });
                    add_cell(row, {text: print_user(issue.user_issue)});
                    add_cell(row, {text: issue.size.item._description});
                    add_cell(row, {text: issue.size._size});
                    add_cell(row, {text: issue._qty});
                    if (status !== '0' && status !== '5') {
                        let div = new Div().e
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
                                field: 'issue_id',
                                value: issue.issue_id
                            }
                        });
                    };
                    add_cell(row, {append: new Link({href: `/stores/issues/${issue.issue_id}`, small: true}).e});
                });
            };
            lines_loaded[status] = true;
            if (status === '1' && typeof getRequestedActions === 'function') getRequestedActions();
            if (status === '4' && typeof getReturnAction     === 'function') getReturnAction();
        },
        {
            table: 'issues',
            query: [`_status=${status}`],
            spinner: `status_${status}`
        }
    );
};
window.addEventListener('load', function () {
    document.querySelector('#reload').addEventListener('click',  function () {getIssues('0')});
    document.querySelector('#reload').addEventListener('click',  function () {getIssues('1')});
    document.querySelector('#reload').addEventListener('click',  function () {getIssues('2')});
    document.querySelector('#reload').addEventListener('click',  function () {getIssues('3')});
    document.querySelector('#reload').addEventListener('click',  function () {getIssues('4')});
    document.querySelector('#reload').addEventListener('click',  function () {getIssues('5')});
});