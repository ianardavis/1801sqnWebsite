function getOrders() {
    clear_table('orders')
    .then(tbl_orders => {
        let statuses = document.querySelectorAll("input[type='checkbox']:checked") || [],
            query = [];
        statuses.forEach(e => query.push(e.value));
        get({
            table: 'orders',
            query: [query.join('&')]
        })
        .then(function ([orders, options]) {
            let order_statuses = {'0': 'Cancelled', '1': 'Placed', '2': 'Demanded', '3': 'Closed'},
                row_index = 0;
            orders.forEach(order => {
                let row = tbl_orders.insertRow(-1);
                add_cell(row, table_date(order.createdAt));
                add_cell(row, {text: order.size.item.description});
                add_cell(row, {text: order.size.size});
                add_cell(row, {text: order.qty});
                add_cell(row, {
                    text: order_statuses[order.status] || 'Unknown',
                    ...(
                        [1, 2].includes(order.status) ?
                        {
                            classes: ['actions'],
                            data:    [
                                {field: 'id',    value: order.order_id},
                                {field: 'index', value: row_index}
                            ]
                        } : {}
                    )
                });
                add_cell(row, {append: new Link({
                    href: `/orders/${order.order_id}`,
                    small: true
                }).e})
            });
        });
    });
};
function filterDate() {
    let from = document.querySelector('#createdAt_from'),
        to   = document.querySelector('#createdAt_to');
    if (from.value) console.log('from: ', new Date(from.value).getTime() || '');
    if (to.value)   console.log('to: ',   new Date(to.value).getTime() || '');
};
addReloadListener(getOrders);
window.addEventListener('load', function () {
    addListener('sel_status', getOrders, 'change');
    addListener('status_0',   getOrders, 'change');
    addListener('status_1',   getOrders, 'change');
    addListener('status_2',   getOrders, 'change');
    addListener('status_3',   getOrders, 'change');
    addListener('createdAt_from', filterDate, 'change');
    addListener('createdAt_to',   filterDate, 'change');
});
