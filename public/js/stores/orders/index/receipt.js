function getReceiptActions() {
    document.querySelectorAll('.actions-1').forEach(row => {
        get(
            function (order, options) {
                if (order._status === 1) {
                    let select = document.querySelector(`#sel_action_${order.order_id}`);
                    if (select) select.appendChild(new Option({text: 'Receipt', value: '3'}).e);
                };
            },
            {
                table: 'order',
                query: [`order_id=${row.dataset.order_id}`]
            }
        );
    });
};
function loadReceiptActions() {
    let actions_interval = window.setInterval(
        function () {
            if (lines_loaded['1'] === true) {
                getReceiptActions();
                clearInterval(actions_interval);
            }
        },
        500
    );
};
document.querySelector('#reload').addEventListener('click', loadReceiptActions);