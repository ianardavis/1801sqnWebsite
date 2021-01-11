let issue_statuses = {"0": "Cancelled", "1": "Requested", "2": "Approved", "3": "Ordered", "4": "Issued", "5": "Returned"}
function getIssues(status) {
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
                    add_cell(row, {
                        classes: [`actions-${status}`],
                        data: {
                            field: 'issue_id',
                            value: issue.issue_id
                        }
                    });
                    add_cell(row, {append: new Link({href: `/stores/issues/${issue.issue_id}`, small: true}).e});
                });
            };
            if (status === '1' && typeof getRequestedActions === 'function') getRequestedActions()
            if (status === '2' && typeof getApprovedActions  === 'function') getApprovedActions()
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