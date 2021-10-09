let statuses = {'0': 'Cancelled', '1': 'Placed', '2': 'Demanded', '3': 'Received'};
function showOrder() {
    get({
        table: 'order',
        query: [`order_id=${path[2]}`]
    })
    .then(function ([order, options]) {
        set_breadcrumb({text: order.order_id});
        set_innerText({id: 'size_desc', text: print_size(order.size)});
        set_innerText({id: 'item_name', text: order.size.item.description});
        set_innerText({id: 'qty',       text: order.qty});
        set_innerText({id: 'createdAt', text: print_date(order.createdAt, true)});
        set_innerText({id: 'updatedAt', text: print_date(order.updatedAt, true)});
        set_innerText({id: 'status',    text: statuses[order.status]});
        set_innerText({id: 'user',      text: print_user(order.user)});
        set_href({id: 'user_link',      value: `/users/${order.user_id}`});
        set_href({id: 'size_desc_link', value: `/sizes/${order.size_id}`});
        set_href({id: 'item_name_link', value: `/items/${order.size.item_id}`});
    })
    .catch(err => window.location.href = '/orders');
};
addReloadListener(showOrder);