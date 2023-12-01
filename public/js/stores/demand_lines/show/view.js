const line_statuses = {"0": "Cancelled", "1": "Pending", "2": "Open", "3": "Closed"};
function getDemandLine() {
    function display_details([line, options]) {
        setBreadcrumb(`${line.size.item.description} | ${line.size.item.size_text1 || 'Size'}: ${printSize(line.size)}`);
        setInnerText('bcr_demand',     `${line.demand.supplier.name} - ${printDate(line.demand.createdAt)}`);
        setInnerText('line_item',      line.size.item.description);
        setInnerText('line_size',      printSize(line.size));
        setInnerText('line_qty',       line.qty);
        setInnerText('line_user',      printUser(line.user));
        setInnerText('line_createdAt', printDate(line.createdAt, true));
        setInnerText('line_updatedAt', printDate(line.updatedAt, true));
        return line;
    };
    function set_links(line) {
        setHREF('bcr_demand',       `/demands/${line.demand_id}`);
        setHREF('line_user_link',   `/users/${line.user_id}`);
        setHREF('line_item_link',   `/items/${line.size.item_id}`);
        setHREF('line_size_link',   `/sizes/${line.size_id}`);
        setHREF('line_serial_link', (line.serial ? `/serials/${line.serial_id}`: ''));
        return line;
    };
    function set_status_badges(line) {
        clearStatuses(3, line_statuses);
        if ([0, 1, 2, 3].includes(line.status)) {
            if (line.status === 0) {
                setBadge(1, 'danger', 'Cancelled');

            } else {
                setBadge(1, 'success');
                if (line.status > 1) {
                    setBadge(2, 'success');
                };
                if (line.status > 2) {
                    setBadge(3, 'success');
                };
            };
        };
        return line;
    };
    function list_orders(line) {
        clear('tbl_orders')
        .then(tbl_orders => {
            setCount('order', line.orders.length);
            line.orders.forEach(order => {
                let row = tbl_orders.insertRow(-1);
                addCell(row, tableDate(order.createdAt));
                addCell(row, {text: order.qty});
                addCell(row, {append: new Link(`/orders/${order.order_id}`).e});
            });
        });
        return line;
    };

    get({
        table: 'demand_line',
        where: {line_id: path[2]}
    })
    .then(display_details)
    .then(set_links)
    .then(set_status_badges)
    .then(list_orders);
};
window.addEventListener('load', function () {
    addListener('reload', getDemandLine);
});