function getDemandActions() {
    document.querySelectorAll('.actions-1').forEach(row => {
        get(
            {
                table: 'order',
                query: [`order_id=${row.dataset.order_id}`]
            },
            function (order, options) {
                if (order.status === 1) {
                    let select = document.querySelector(`#sel_action_${order.order_id}`);
                    if (select) select.appendChild(new Option({text: 'Demand', value: '2'}).e);
                };
            }
        );
    });
};
function loadDemandActions() {
    let actions_interval = window.setInterval(
        function () {
            if (lines_loaded['1'] === true) {
                getDemandActions();
                clearInterval(actions_interval);
            }
        },
        500
    );
};
document.querySelector('#reload').addEventListener('click', loadDemandActions);