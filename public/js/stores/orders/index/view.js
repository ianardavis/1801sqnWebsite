let order_statuses = {'0': 'Cancelled', '1': 'Placed', '2': 'Demanded', '3': 'Closed'};
function getOrders() {
    clear_table('orders')
    .then(tbl_orders => {
        let sel_status = document.querySelector('#sel_status') || {value: ''};
        get({
            table: 'orders',
            query: [sel_status.value]
        })
        .then(function ([orders, options]) {
            orders.forEach(order => {
                let row = tbl_orders.insertRow(-1);
                add_cell(row, table_date(order.createdAt));
                add_cell(row, {text: order.size.item.description});
                add_cell(row, {text: order.size.size});
                add_cell(row, {text: order.qty});
                add_cell(row, {text: order_statuses[order.status] || 'Unknown'});
                add_cell(row, {append: new Link({
                    href: `/orders/${order.order_id}`,
                    small: true
                }).e})
            });
        });
    });
};
addReloadListener(getOrders);
addListener('sel_status', getOrders, 'change')