let order_statuses = {'0': 'Cancelled', '1': 'Placed', '2': 'Demanded', '3': 'Received'};
function getOrders() {
    clear('tbl_orders')
    .then(tbl_orders => {
        let sort_cols = tbl_orders.parentNode.querySelector('.sort') || null;
        get({
            table: 'orders',
            query: [`"size_id":"${path[2]}"`],
            ...sort_query(sort_cols)
        })
        .then(function ([orders, options]) {
            set_count({id: 'order', count: orders.length});
            orders.forEach(order => {
                try {
                    let row = tbl_orders.insertRow(-1);
                    add_cell(row, table_date(order.createdAt));
                    add_cell(row, {text: order.qty});
                    add_cell(row, {text: order_statuses[order.status] || 'Unknown'});
                    add_cell(row, {append: new Button({
                        modal: 'order_view',
                        data: [{field: 'id', value: order.order_id}],
                        small: true
                    }).e});
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
        query: [`"order_id":"${order_id}"`],
        spinner: 'order_view'
    })
    .then(function ([order, options]){
        console.log(order)
        set_innerText({id: 'order_user',      text: print_user(order.user)});
        set_innerText({id: 'order_qty',       text: order.qty});
        set_innerText({id: 'order_status',    text: order_statuses[order.status]});
        set_innerText({id: 'order_createdAt', text: print_date(order.createdAt)});
        set_innerText({id: 'order_updatedAt', text: print_date(order.updatedAt)});
        set_innerText({id: 'order_id',        text: order.order_id});
        set_href({id: 'btn_order_link',  value: `/orders/${order.order_id}`});
        set_href({id: 'order_user_link', value: `/users/${order.user_id}`});
    })
    .catch(err => console.log(err));
};
addReloadListener(getOrders);
window.addEventListener('load', function () {
    addListener('sel_order_status', getOrders, 'change');
    modalOnShow('order_view', function (event) {viewOrder(event.relatedTarget.dataset.id)});
});