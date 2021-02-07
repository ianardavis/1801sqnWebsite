function showOrder() {
    let statuses = {'0': 'Cancelled', '1': 'Placed', '2': 'Demanded', '3': 'Received'};
    get(
        {
            table: 'order',
            query: [`order_id=${path[3]}`],
            onFail: function () {window.location.href = '/stores/orders'}
        },
        function (order, options) {
            set_innerText({id: 'size_desc', text: order.size._size});
            set_attribute({id: 'size_desc_link',  attribute: 'href', value: `/stores/sizes/${order.size_id}`});
            set_innerText({id: 'item_name', text: order.size.item._description});
            set_attribute({id: 'item_name_link',  attribute: 'href', value: `/stores/items/${order.size.item_id}`});
            set_innerText({id: '_qty',      text: order._qty});
            set_innerText({id: 'createdAt', text: print_date(order.createdAt, true)});
            set_innerText({id: 'updatedAt', text: print_date(order.updatedAt, true)});
            set_innerText({id: '_status',   text: statuses[order._status]});
            set_innerText({id: 'user',      text: print_user(order.user)});
            set_attribute({id: 'user_link', attribute: 'href', value: `/stores/users/${order.user_id}`});
            set_breadcrumb({
                text: order.order_id,
                href: `/stores/orders/${order.order_id}`
            });
        }
    );
};
document.querySelector('#reload').addEventListener('click', showOrder);