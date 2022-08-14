let order_statuses = {'0': 'Cancelled', '1': 'Placed', '2': 'Demanded', '3': 'Received'};
function getOrders() {
    clear('tbl_orders')
    .then(tbl_orders => {
        get({
            table: 'orders',
            ...build_filter_query('order'),
            func: getOrders
        })
        .then(function ([result, options]) {
            let row_index = 0;
            result.orders.forEach(order => {
                let row = tbl_orders.insertRow(-1);
                add_cell(row, table_date(order.createdAt));
                add_cell(row, {text: order.size.item.description});
                add_cell(row, {text: print_size(order.size)});
                add_cell(row, {text: order.qty});
                add_cell(row, {
                    text: order_statuses[order.status] || 'Unknown',
                    append: new Hidden({
                        attributes: [
                            {field: 'name',  value: `lines[][${row_index}][order_id]`},
                            {field: 'value', value: order.order_id}
                        ]
                    }).e
                });
                let radios = [], args = [order.order_id, row_index, receive_options];
                if (
                    order.status === 0 ||
                    order.status === 1 ||
                    order.status === 2
                ) {
                    if (typeof nil_radio     === 'function') radios.push(nil_radio(    ...args));
                };
                if (
                    order.status === 1 ||
                    order.status === 2
                ) {
                    if (typeof cancel_radio  === 'function') radios.push(cancel_radio( ...args));
                };
                if (order.status === 0) {
                    if (typeof restore_radio === 'function') radios.push(restore_radio(...args));
                };
                if (order.status === 1) {
                    if (typeof demand_radio  === 'function') radios.push(demand_radio( ...args));
                };
                if (order.status === 1) {
                    if (typeof receive_radio === 'function') radios.push(receive_radio(...args));
                };
                radios.push(new Div({attributes: [{field: 'id', value: `${order.order_id}_details`}]}).e);
                add_cell(row, {
                    id: `${order.order_id}_row`,
                    append: radios
                });
                add_cell(row, {append: new Link({href: `/orders/${order.order_id}`}).e});
                row_index++;
            });
        });
    });
};
addReloadListener(getOrders);
sort_listeners(
    'orders',
    getOrders,
    [
        {value: '["createdAt"]',                 text: 'Date', selected: true},
        {value: '["size","item","description"]', text: 'Description'},
        {value: '["size","size1"]',              text: 'Size 1'},
        {value: '["size","size2"]',              text: 'Size 2'},
        {value: '["size","size3"]',              text: 'Size 3'},
        {value: '["qty"]',                       text: 'Qty'},
        {value: '["status"]',                    text: 'Status'}
    ]
);
window.addEventListener('load', function () {
    addListener('filter_order_statuses',       getOrders, 'input');
    addListener('filter_order_createdAt_from', getOrders, 'input');
    addListener('filter_order_createdAt_to',   getOrders, 'input');
    addListener('filter_order_item',           getOrders, 'input');
    addListener('filter_order_size_1',         getOrders, 'input');
    addListener('filter_order_size_2',         getOrders, 'input');
    addListener('filter_order_size_3',         getOrders, 'input');
    addFormListener(
        'order_edit',
        'PUT',
        '/orders',
        {onComplete: getOrders}
    );
});
