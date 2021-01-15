function getReceiptActions() {
    document.querySelectorAll('.actions-1').forEach(row => {
        get(
            function (order, options) {
                if (order._status === 1) {
                    let select = document.querySelector(`#sel_action_${order.order_id}`);
                    if (select) {
                        select.appendChild(new Option({text: 'Receipt', value: '3'}).e);
                        select.addEventListener('change', function () {
                            if (this.value ==='3') {
                                let receive_div = new Div({attributes: [{field: 'id', value: `div_receive_${order.order_id}`}]}).e;
                                if (order.size._serials) {
                                    receive_div.appendChild(new Input({attributes: [
                                        {field: 'id',       value: `sel_serial_${order.order_id}`},
                                        {field: 'name',     value: `lines[${order.order_id}][_serial]`},
                                        {field: 'placeholder', value: 'Enter Serial #'},
                                        {field: 'required', value: true},
                                    ], small: true}).e);
                                    receive_div.appendChild(new Select({attributes: [
                                        {field: 'id',       value: `sel_location_${order.order_id}`},
                                        {field: 'name',     value: `lines[${order.order_id}][location][location_id]`}
                                    ], small: true}).e);
                                } else {
                                    receive_div.appendChild(new Select({attributes: [
                                        {field: 'id',       value: `sel_stock_${order.order_id}`},
                                        {field: 'name',     value: `lines[${order.order_id}][stock_id]`}
                                    ], small: true}).e);
                                    listStocks(order.order_id, order.size, true);
                                };
                                receive_div.appendChild(new Input({attributes: [
                                    {field: 'id',       value: `sel_location_${order.order_id}`},
                                    {field: 'name',     value: `lines[${order.order_id}][location][_location]`},
                                    {field: 'placeholder', value: 'Enter Location'}
                                ], small: true}).e);
                                listLocations(order.order_id, true);
                                row.appendChild(receive_div);
                            };
                        })
                    };
                    
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