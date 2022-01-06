let statuses = {'0': 'Cancelled', '1': 'Placed', '2': 'Demanded', '3': 'Received'};
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
        set_innerText('status',    statuses[order.status]);
        set_innerText('user',      print_user(order.user));
        set_href('user_link',      `/users/${order.user_id}`);
        set_href('size_desc_link', `/sizes/${order.size_id}`);
        set_href('item_name_link', `/items/${order.size.item_id}`);
    })
    .catch(err => window.location.href = '/orders');
};
window.addEventListener('load', function () {
    addFormListener(
        'mark_cancelled',
        'PUT',
        `/orders/${path[2]}/mark/0`,
        {onComplete: [
            getOrder,
            getActions
        ]}
    );
    addFormListener(
        'mark_placed',
        'PUT',
        `/orders/${path[2]}/mark/1`,
        {onComplete: [
            getOrder,
            getActions
        ]}
    );
    addFormListener(
        'mark_demanded',
        'PUT',
        `/orders/${path[2]}/mark/2`,
        {onComplete: [
            getOrder,
            getActions
        ]}
    );
    addFormListener(
        'mark_received',
        'PUT',
        `/orders/${path[2]}/mark/3`,
        {onComplete: [
            getOrder,
            getActions
        ]}
    );
});
addReloadListener(getOrder);