let order_statuses = {'0': 'Cancelled', '1': 'Placed', '2': 'Demanded', '3': 'Received'};
function getOrders() {
    clear('tbl_orders')
    .then(tbl_orders => {
        get({
            table: 'orders',
            where: {size_id: path[2]},
            func: getOrders
        })
        .then(function ([result, options]) {
            set_count('order', result.count);
            result.orders.forEach(order => {
                try {
                    let row = tbl_orders.insertRow(-1);
                    add_cell(row, table_date(order.createdAt));
                    add_cell(row, {text: order.qty});
                    add_cell(row, {text: order_statuses[order.status] || 'Unknown'});
                    add_cell(row, {append: new Modal_Button(
                        _search(),
                        'order_view',
                        [{field: 'id', value: order.order_id}]
                    ).e});
                } catch (error) {
                    console.log(error);
                };
            });
        });
    });
};
function viewOrder(order_id) {
    get({
        table: 'order',
        where: {order_id: order_id},
        spinner: 'order_view'
    })
    .then(function ([order, options]){
        console.log(order)
        set_innerText('order_user',      print_user(order.user));
        set_innerText('order_qty',       order.qty);
        set_innerText('order_status',    order_statuses[order.status]);
        set_innerText('order_createdAt', print_date(order.createdAt));
        set_innerText('order_updatedAt', print_date(order.updatedAt));
        set_innerText('order_id',        order.order_id);
        set_href('btn_order_link',  `/orders/${order.order_id}`);
        set_href('order_user_link', `/users/${order.user_id}`);
    })
    .catch(err => console.log(err));
};
window.addEventListener('load', function () {
    add_listener('reload', getOrders);
    add_listener('sel_order_statuses', getOrders, 'change');
    modalOnShow('order_view', function (event) {viewOrder(event.relatedTarget.dataset.id)});
    add_sort_listeners('orders', getOrders);
    getOrders();
});