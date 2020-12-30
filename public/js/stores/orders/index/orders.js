let order_statuses = {"0": "Cancelled", "1": "Draft", "2": "Open", "3": "Complete"};
function getOrders() {
    let sel_status = document.querySelector('#sel_status');
    get(
        function (orders, options) {
            let table_body = document.querySelector('#tbl_orders');
            if (table_body) {
                table_body.innerHTML = '';
                orders.forEach(order => {
                    let row = table_body.insertRow(-1);
                    if (Number(order.user_id_order) === -1) add_cell(row, {text: 'Backing Stock'}) 
                    else add_cell(row, {text: print_user(order.user_order)});
                    add_cell(row, {
                        sort: new Date(order.createdAt).getTime(),
                        text: print_date(order.createdAt)
                    });
                    add_cell(row, {text: order.lines.length || '0'});
                    add_cell(row, {text: order_statuses[order._status] || 'Unknown'});
                    add_cell(row, {append: new Link({href: `/stores/orders/${order.order_id}`, small: true}).e});
                });
            };
        },
        {
            table: 'orders',
            query: [sel_status.value]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getOrders);
document.querySelector('#sel_status').addEventListener('change', getOrders);