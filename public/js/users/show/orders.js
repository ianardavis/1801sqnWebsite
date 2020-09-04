showOrders = (lines, options) => {
    let table_body    = document.querySelector('#orderTable'),
        order_count = document.querySelector('#order_count');
    if (lines) order_count.innerText = lines.length || '0';
    table_body.innerHTML = '';
    lines.forEach(line => {
        let row = table_body.insertRow(-1);
        add_cell(row, {
            sort: new Date(line.order._date).getTime(),
            text: new Date(line.order._date).toDateString()
        });
        add_cell(row, {text: line.size.item._description});
        add_cell(row, {text: line.size._size});
        add_cell(row, {text: line._qty});
        add_cell(row, {text: line._status});
        //////////////////
        if (line.demand_line_id) {
            add_cell(row, {
                append: new Link({
                    href: '/stores/demands/' + line.demand_line_id,
                    small: true,
                    float: true
                }).link
            });
        } else add_cell(row);
        //////////////////
        add_cell(row);
        add_cell(row);
        add_cell(row, {
            append: new Link({
                href: '/stores/orders/' + line.order_id,
                small: true
            }).link
        });
    });
    hide_spinner('order_lines');
};