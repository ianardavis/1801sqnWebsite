let order_statuses = {'0': 'Cancelled', '1': 'Placed', '2': 'Demanded', '3': 'Received'};
function getOrders() {
    get(
        function (orders, options) {
            let table_body  = document.querySelector('#tbl_orders');
            set_count({id: 'order', count: orders.length});
            if (table_body) {
                table_body.innerHTML = '';
                orders.forEach(order => {
                    try {
                        let row = table_body.insertRow(-1);
                        add_cell(row, {
                            sort: new Date(order.createdAt).getTime(),
                            text: print_date(order.createdAt)
                        });
                        add_cell(row, {text: order._qty});
                        add_cell(row, {text: order_statuses[order._status]});
                        add_cell(row, {append: new Link({
                            href: `/stores/orders/${order.order_id}`,
                            small: true
                        }).e});
                    } catch (error) {
                        console.log(error);
                    };
                });
            };
        },
        {
            table: 'orders',
            query: [`size_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getOrders);