let statuses = {0: 'Cancelled', 1: 'Placed', 2: 'Demanded', 3: 'Received'};
function getOrder() {
    disable_button('mark_as');
    for (let i=0; i<=5 ; i++) {
        disable_button(`mark_${i}`);
    };
    get({
        table: 'order',
        where: {order_id: path[2]}
    })
    .then(function ([order, options]) {
        set_breadcrumb(order.order_id);
        set_innerText('order_size',      print_size(order.size));
        set_innerText('order_item',      order.size.item.description);
        set_innerText('order_qty',       order.qty);
        set_innerText('order_createdAt', print_date(order.createdAt, true));
        set_innerText('order_updatedAt', print_date(order.updatedAt, true));
        set_innerText('order_user',      print_user(order.user));

        set_href('order_user_link', `/users/${order.user_id}`);
        set_href('order_size_link', `/sizes/${order.size_id}`);
        set_href('order_item_link', `/items/${order.size.item_id}`);

        if (typeof set_mark_as_options === 'function') set_mark_as_options(order.status);

        set_status_badges(order.status);
    })
    .catch(err => window.location.href = '/orders');
};
function set_status_badges(status) {
    clear_statuses(3, statuses);
    if ([0, 1, 2, 3].includes(status)) {
        if (status === 0) {
            set_badge(1, 'danger', 'Cancelled');

        } else {
            set_badge(1, 'success');
            if (status > 1) {
                set_badge(2, 'success');
            };
            if (status > 2) {
                set_badge(3, 'success');
            };
        };
    };
};
window.addEventListener('load', function () {
    addListener('reload', getOrder);
    getOrder();
});