showDemands = (demands, options = {}) => {
    let table_body = document.querySelector('#tbl_demands');
    table_body.innerHTML = '';
    demands.forEach(demand => {
        let row = table_body.insertRow(-1);
        if (Number(order.ordered_for) === -1) add_cell(row, {text: 'Backing Stock'}) 
        else add_cell(row, {text: order._for.rank._rank + ' ' + order._for.full_name});
        add_cell(row, {
            sort: new Date(order._date).getTime(),
            text: new Date(order._date).toDateString()
        });
        add_cell(row, {text: order.lines.length});
        if (order._status === 0) add_cell(row, {text: 'Cancelled'})
        else if (order._status === 1) add_cell(row, {text: 'Draft'})
        else if (order._status === 2) add_cell(row, {text: 'Open'})
        else if (order._status === 3) add_cell(row, {text: 'Complete'});
        add_cell(row, {append: new Link({href: `/stores/orders/${order.order_id}`, small: true}).link});
    });
};