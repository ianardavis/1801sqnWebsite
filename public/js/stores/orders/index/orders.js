showOrders = (orders, options = {}) => {
    let table_body = document.querySelector('#tbl_orders');
    table_body.innerHTML = '';
    orders.forEach(order => {
        let row = table_body.insertRow(-1);
        if (Number(order.ordered_for) === -1) add_cell(row, {text: 'Backing Stock'}) 
        else add_cell(row, {text: print_user(order.user_for)});
        add_cell(row, {
            sort: new Date(order.createdAt).getTime(),
            text: print_date(order.createdAt)
        });
        add_cell(row, {text: order.lines.length || '0'});
        if (order._status === 0) add_cell(row, {text: 'Cancelled'})
        else if (order._status === 1) add_cell(row, {text: 'Draft'})
        else if (order._status === 2) add_cell(row, {text: 'Open'})
        else if (order._status === 3) add_cell(row, {text: 'Complete'});
        add_cell(row, {append: new Link({href: `/stores/orders/${order.order_id}`, small: true}).e});
    });
};