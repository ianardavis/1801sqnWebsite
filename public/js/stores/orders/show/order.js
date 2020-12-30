function getOrder() {
    get(
        function (order, options) {
            set_innerText({id: 'user_order',      text: print_user(order.user_order)});
            set_innerText({id: 'user',            text: print_user(order.user)});
            set_attribute({id: 'user_order_link', attribute: 'href', value: `/stores/users/${order.user_id_order}`});
            set_attribute({id: 'user_link',       attribute: 'href', value: `/stores/users/${order.user_id}`});
            set_innerText({id: 'createdAt',       text: print_date(order.createdAt, true)});
            set_innerText({id: 'updatedAt',       text: print_date(order.updatedAt, true)});
            set_innerText({id: '_status',         text: order_statuses[order._status]});
            set_breadcrumb({text: order.order_id, href: `/stores/orders/${order.order_id}`});
        },
        {
            table: 'order',
            query: [`order_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getOrder);