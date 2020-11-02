let order_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Open', '3': 'Demanded', '4': 'Received', '5': 'Issued', '6': 'Closed'};
showOrders = (lines, options) => {
    let table_body    = document.querySelector('#orderTable'),
        order_count = document.querySelector('#order_count');
    if (lines) order_count.innerText = lines.length || '0';
    table_body.innerHTML = '';
    lines.forEach(line => {
        let row = table_body.insertRow(-1);
        add_cell(row, {
            sort: new Date(line.createdAt).getTime(),
            text: print_date(line.createdAt)
        });
        add_cell(row, {text: line.size.item._description});
        add_cell(row, {text: line.size._size});
        add_cell(row, {text: line._qty});
        add_cell(row, {text: order_statuses[String(line._status)]});
        //////////////////
        if (line.demand_line_id) {
            add_cell(row, {
                append: new Link({
                    href: '/stores/demands/' + line.demand_line_id,
                    small: true,
                    float: true
                }).e
            });
        } else add_cell(row);
        //////////////////
        add_cell(row);
        add_cell(row);
        add_cell(row, {
            append: new Link({
                href: '/stores/orders/' + line.order_id,
                small: true
            }).e
        });
    });
    hide_spinner('order_lines');
};