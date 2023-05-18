const line_statuses = {"0": "Cancelled", "1": "Pending", "2": "Open", "3": "Closed"};
function getDemandLine() {
    function display_details([line, options]) {
        set_breadcrumb(`${line.size.item.description} | ${line.size.item.size_text1 || 'Size'}: ${print_size(line.size)}`);
        set_innerText('bcr_demand',     `${line.demand.supplier.name} - ${print_date(line.demand.createdAt)}`);
        set_innerText('line_item',      line.size.item.description);
        set_innerText('line_size',      print_size(line.size));
        set_innerText('line_qty',       line.qty);
        set_innerText('line_user',      print_user(line.user));
        set_innerText('line_createdAt', print_date(line.createdAt, true));
        set_innerText('line_updatedAt', print_date(line.updatedAt, true));
        return line;
    };
    function set_links(line) {
        set_href('bcr_demand',       `/demands/${line.demand_id}`);
        set_href('line_user_link',   `/users/${line.user_id}`);
        set_href('line_item_link',   `/items/${line.size.item_id}`);
        set_href('line_size_link',   `/sizes/${line.size_id}`);
        set_href('line_serial_link', (line.serial ? `/serials/${line.serial_id}`: ''));
        return line;
    };
    function set_status_badges(line) {
        clear_statuses(3, line_statuses);
        if ([0, 1, 2, 3].includes(line.status)) {
            if (line.status === 0) {
                set_badge(1, 'danger', 'Cancelled');

            } else {
                set_badge(1, 'success');
                if (line.status > 1) {
                    set_badge(2, 'success');
                };
                if (line.status > 2) {
                    set_badge(3, 'success');
                };
            };
        };
        return line;
    };
    function list_orders(line) {
        clear('tbl_orders')
        .then(tbl_orders => {
            set_count('order', line.orders.length);
            line.orders.forEach(order => {
                let row = tbl_orders.insertRow(-1);
                add_cell(row, table_date(order.createdAt));
                add_cell(row, {text: order.qty});
                add_cell(row, {append: new Link(`/orders/${order.order_id}`).e});
            });
        });
        return line;
    };

    get({
        table: 'demand_line',
        where: {demand_line_id: path[2]}
    })
    .then(display_details)
    .then(set_links)
    .then(set_status_badges)
    .then(list_orders);
};
window.addEventListener('load', function () {
    add_listener('reload', getDemandLine);
});