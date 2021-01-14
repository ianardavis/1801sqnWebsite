function getOrderActions() {
    document.querySelectorAll('.actions-2').forEach(row => {
        get(
            function (issue, options) {
                if (issue._status === 2 && issue.size._orderable) {
                    let select = document.querySelector(`#sel_action_${issue.issue_id}`);
                    if (select) select.appendChild(new Option({text: 'Order', value: '3'}).e);
                };
            },
            {
                table: 'issue',
                query: [`issue_id=${row.dataset.issue_id}`]
            }
        );
    });
};
function loadOrderActions() {
    let actions_interval = window.setInterval(
        function () {
            if (lines_loaded['2'] === true) {
                getOrderActions();
                clearInterval(actions_interval);
            }
        },
        500
    );
};
document.querySelector('#reload').addEventListener('click', loadOrderActions);