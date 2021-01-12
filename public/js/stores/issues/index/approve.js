function getRequestedActions() {
    document.querySelectorAll('.actions-1').forEach(row => {
        get(
            function (issue, options) {
                if (issue._status === 1) {
                    let select = document.querySelector(`#sel_action_${issue.issue_id}`);
                    if (select) {
                        select.appendChild(new Option({text: 'Approve', value: '2'}).e);
                        select.appendChild(new Option({text: 'Decline', value: '0'}).e);
                    };
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