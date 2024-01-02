let order_statuses = {
    '0': 'Cancelled', 
    '1': 'Placed', 
    '2': 'Demanded', 
    '3': 'Received'
};
function get_orders() {
    Promise.all([
        clear('tbl_orders'),
        filterStatus('order')
    ])
    
    .then(([tbl_orders, filterStatuses]) => {
        function add_line(order) {
            try {
                let row = tbl_orders.insertRow(-1);
                addCell(row, tableDate(order.createdAt));
                addCell(row, {text: order.qty});
                addCell(row, {text: order_statuses[order.status] || 'Unknown'});
                addCell(row, {append: new Modal_Button(
                    _search(),
                    'order_view',
                    [{field: 'id', value: order.order_id}]
                ).e});
            } catch (error) {
                console.error(error);
            };
        };

        get({
            table: 'orders',
            where: {
                size_id: path[2],
                ...filterStatuses
            },
            func: get_orders
        })
        .then(function ([result, options]) {
            setCount('order', result.count);
            result.orders.forEach(order => add_line(order));
        });
    });
};
function viewOrder(order_id) {
    function display_details([order, options]) {
        setInnerText('order_user',      printUser(order.user));
        setInnerText('order_qty',       order.qty);
        setInnerText('order_status',    order_statuses[order.status]);
        setInnerText('order_createdAt', printDate(order.createdAt));
        setInnerText('order_updatedAt', printDate(order.updatedAt));
        setInnerText('order_id',        order.order_id);
        return order;
    };
    function set_links(order) {
        setHREF('btn_order_link',  `/orders/${order.order_id}`);
        setHREF('order_user_link', `/users/${order.user_id}`);
        return order;
    };
    get({
        table: 'order',
        where: {order_id: order_id}
    })
    .then(display_details)
    .then(set_links)
    .catch(err => console.error(err));
};
window.addEventListener('load', function () {
    setStatusFilterOptions('order', [
        {value: '0', text: 'Cancelled'},
        {value: '1', text: 'Placed',   selected: true},
        {value: '2', text: 'Demanded', selected: true},
        {value: '3', text: 'Received'}
    ]);
    addListener('reload', get_orders);
    addListener('filter_order_status', get_orders, 'change');
    modalOnShow('order_view', function (event) {viewOrder(event.relatedTarget.dataset.id)});
    addSortListeners('orders', get_orders);
    get_orders();
});