function getRequestedActions() {
    let actions = document.querySelectorAll('.actions-1');
    actions.forEach(row => {
        get(
            function (issue, options) {
                if (issue._status === 1) {
                    row.appendChild(new Hidden({
                        attributes: [
                            {field: 'name',  value: `lines[${issue.issue_id}][issue_id]`},
                            {field: 'value', value: issue.issue_id}
                        ]
                    }).e);
                    let opts = [];
                    opts.push(new Option({text: 'Requested'}).e);
                    opts.push(new Option({text: 'Approve', value: '2'}).e);
                    opts.push(new Option({text: 'Decline', value: '0'}).e);
                    row.appendChild(new Select({
                        attributes: [
                            {field: 'name', value: `lines[${issue.issue_id}][_status]`}
                        ],
                        options: opts,
                        small: true
                    }).e);
                }
                row.removeAttribute('class');
                row.removeAttribute('data-issue_id')
            },
            {
                table: 'issue',
                query: [`issue_id=${row.dataset.issue_id}`]
            }
        );
    });
};
window.addEventListener('load', function () {
    addFormListener(
        'lines_1',
        'PUT',
        '/stores/issues',
        {
            onComplete: function () {
                getIssues('0');
                getIssues('1');
                getIssues('2');
            }
        }
    );
});