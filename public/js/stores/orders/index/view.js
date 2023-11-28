let order_statuses = {'0': 'Cancelled', '1': 'Placed', '2': 'Added to Demand', '3': 'Received'};
function getOrders() {
    clear('tbl_orders')
    .then(tbl_orders => {
        function add_line(order, index) {
            let row = tbl_orders.insertRow(-1);
            addCell(row, tableDate(order.createdAt));
            addCell(row, {text: order.size.item.description});
            addCell(row, {text: printSize(order.size)});
            addCell(row, {text: order.qty});
            addCell(row, {
                text: order_statuses[order.status] || 'Unknown',
                append: new Hidden_Input({
                    attributes: [
                        {field: 'name',  value: `lines[][${index}][order_id]`},
                        {field: 'value', value: order.order_id}
                    ]
                }).e
            });
            let radios = [], args = [order.order_id, index, receive_options];
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
            radios.push(new Div({attributes: [{field: 'id', value: `details_${order.order_id}`}]}).e);
            addCell(row, {
                id: `${order.order_id}_row`,
                append: radios
            });
            addCell(row, {append: new Link(`/orders/${order.order_id}`).e});
        };
        get({
            table: 'orders',
            like: {
                ...filterItem('order'),
                ...filterSize('order')
            },
            gt: filterDateFrom('order'),
            lt: filterDateTo('order'),
            func: getOrders
        })
        .then(function ([result, options]) {
            let index = 0;
            result.orders.forEach(order => {
                add_line(order, index);
                index++;
            });
        });
    });
};
window.addEventListener('load', function () {
    setStatusFilterOptions('order', [
        {value: '0', text: 'Cancelled'},
        {value: '1', text: 'Placed',          selected: true},
        {value: '2', text: 'Added to Demand', selected: true},
        {value: '3', text: 'Received'}
    ]);
    addListener('reload', getOrders);
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
    addSortListeners('orders', getOrders);
    getOrders();
});