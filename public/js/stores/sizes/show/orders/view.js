let order_statuses = {'0': 'Cancelled', '1': 'Placed', '2': 'Demanded', '3': 'Received'};
function getOrders() {
    clear_table('orders')
    .then(tbl_orders => {
        get({
            table: 'orders',
            query: [`size_id=${path[2]}`]
        })
        .then(function ([orders, options]) {
            set_count({id: 'order', count: orders.length});
            orders.forEach(order => {
                try {
                    let row = tbl_orders.insertRow(-1);
                    add_cell(row, table_date(order.createdAt));
                    add_cell(row, {text: order.qty});
                    add_cell(row, {text: order_statuses[order.status] || 'Unknown'});
                    add_cell(row, {append: new Link({
                        href: `/orders/${order.order_id}`,
                        small: true
                    }).e});
                } catch (error) {
                    console.log(error);
                };
            });
        });
    })
    .catch(err => console.log(err));
};
addReloadListener(getOrders);