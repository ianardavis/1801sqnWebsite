let statuses = {0: 'Cancelled', 1: 'Placed', 2: 'Demanded', 3: 'Received'};
function getOrder() {
    get({
        table: 'order',
        where: {order_id: path[2]}
    })
    .then(function ([order, options]) {
        set_breadcrumb(order.order_id);
        set_innerText('size_desc', print_size(order.size));
        set_innerText('item_name', order.size.item.description);
        set_innerText('qty',       order.qty);
        set_innerText('createdAt', print_date(order.createdAt, true));
        set_innerText('updatedAt', print_date(order.updatedAt, true));
        set_innerText('user',      print_user(order.user));
        set_href('user_link',      `/users/${order.user_id}`);
        set_href('size_desc_link', `/sizes/${order.size_id}`);
        set_href('item_name_link', `/items/${order.size.item_id}`);

        clear_statuses(3, statuses);
        if ([0, 1, 2, 3].includes(order.status)) {
            if (order.status === 0) {
                set_badge(1, 'danger', 'Cancelled');

            } else {
                set_badge(1, 'success');
                if (order.status > 1) {
                    set_badge(2, 'success');
                };
                if (order.status > 2) {
                    set_badge(3, 'success');
                };
            };
        };
    })
    .catch(err => window.location.href = '/orders');
};
window.addEventListener('load', function () {
    addFormListener(
        'mark_as',
        'PUT',
        `/issues/${path[2]}/mark`,
        {
            onComplete: [
                getOrder,
                getActions
            ]
        }
    );
    addListener('reload', getOrder);
    getOrder();
});