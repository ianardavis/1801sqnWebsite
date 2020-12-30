let order_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Open', '3': 'Demanded', '4': 'Received', '5': 'Issued', '6': 'Closed'};
function getOrders () {
    let order_status = document.querySelector('#order_status');
    getByUser(
        function (lines, options) {
            set_count({id: 'order', count: lines.length || '0'})
            let table_body = document.querySelector('#tbl_orders');
            if (table_body) {
                table_body.innerHTML = '';
                lines.forEach(line => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {
                        sort: new Date(line.createdAt).getTime(),
                        text: print_date(line.createdAt)
                    });
                    add_cell(row, {text: line.size.item._description});
                    add_cell(row, {text: line.size._size});
                    add_cell(row, {text: line._qty});
                    add_cell(row, {text: order_statuses[String(line._status)]});
                    //////////////////
                    if (line.demand_line_id) {
                        add_cell(row, {
                            append: new Link({
                                href: `/stores/demands/${line.demand_line_id}`,
                                small: true,
                                float: true
                            }).e
                        });
                    } else add_cell(row);
                    //////////////////
                    add_cell(row);
                    add_cell(row);
                    add_cell(row, {
                        append: new Link({
                            href: `/stores/orders/${line.order_id}`,
                            small: true
                        }).e
                    });
                });
            };
        },
        {
            table: 'order_lines',
            user_id: path[3],
            query: [order_status.value]
        }
    );
};
function getDraftOrders() {
    get(
        function (orders, options) {
            let crd_draft_order = document.querySelector('#crd_draft_order');
            if (crd_draft_order) {
                if (orders.length > 0) {
                    crd_draft_order.classList.remove('hidden');
                    set_count({id: 'draft_order', count: orders.length || 0});
                    let draft_orders = document.querySelector('#draft_orders');
                    if (draft_orders) {
                        draft_orders.innerHTML = '';
                        orders.forEach(e => {
                            draft_orders.appendChild(
                                new P({append: new A({
                                    classes: ['f-10'],
                                    href: `/stores/orders/${e.order_id}`,
                                    text: `Order ${e.order_id}| Started: ${print_date(e.createdAt, true)}`
                                }).e}).e,
                                
                            );
                        });
                    };
                } else crd_draft_order.classList.add('hidden');
            };
        },
        {
            table: 'orders',
            query: [`user_id_order=${path[3]}`,'_status=1']
        }
    );
};
document.querySelector('#reload').addEventListener('click', getOrders);
document.querySelector('#reload').addEventListener('click', getDraftOrders);
document.querySelector('#order_status').addEventListener('change', getOrders);