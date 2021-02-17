function getOrderActions() {
    document.querySelectorAll('.actions-2').forEach(row => {
        get(
            {
                table: 'issue',
                query: [`issue_id=${row.dataset.id}`]
            },
            function (issue, options) {
                if (issue._status === 2 && issue.size._orderable) {
                    let select = document.querySelector(`#sel_action_${issue.issue_id}`);
                    if (select) select.appendChild(new Option({text: 'Order', value: '3'}).e);
                };
            }
        );
    });
};