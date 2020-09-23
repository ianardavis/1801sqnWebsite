showOrders = (orders, options = {}) => {
    let table_body = document.querySelector('#orderTable');
    table_body.innerHTML = '';
    orders.forEach(order => {
        let row = table_body.insertRow(-1);
        if (Number(order.ordered_for) === -1) add_cell(row, {text: 'Backing Stock'}) 
        else add_cell(row, {text: order._for.rank._rank + ' ' + order._for.full_name});
        add_cell(row, {
            sort: new Date(order._date).getTime(),
            text: new Date(order._date).toDateString()
        });
        add_cell(row, {text: order.lines.length});
        if (order._complete) add_cell(row, {html: _check()})
        else add_cell(row);
        if (order._closed)   add_cell(row, {html: _check()})
        else add_cell(row);
        add_cell(row, {append: new Link({href: `/stores/orders/${order.order_id}`, small: true}).link});
    });
};