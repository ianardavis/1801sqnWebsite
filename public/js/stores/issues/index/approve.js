function getRequestedActions() {
    document.querySelectorAll('.actions-1').forEach(row => {
        get(
            {
                table: 'issue',
                query: [`issue_id=${row.dataset.issue_id}`]
            },
            function (issue, options) {
                if (issue._status === 1) {
                    let select = document.querySelector(`#sel_action_${issue.issue_id}`);
                    if (select) {
                        select.appendChild(new Option({text: 'Approve', value: '2'}).e);
                        select.appendChild(new Option({text: 'Decline', value: '0'}).e);
                    };
                };
            }
        );
    });
};
window.addEventListener('load', function () {
    addFormListener(
        'lines_1',
        'PUT',
        '/issues',
        {
            onComplete: function () {
                getIssues('0');
                getIssues('1');
                getIssues('2');
            }
        }
    );
});