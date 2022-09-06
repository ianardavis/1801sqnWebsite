let line_statuses = {"0": "Cancelled", "1": "Pending", "2": "Open", "3": "Closed"};
function getDemandLine() {
    get({
        table: 'demand_line',
        where: {demand_line_id: path[2]}
    })
    .then(function ([line, options]) {
        set_breadcrumb(`${line.size.item.description} | ${line.size.item.size_text1 || 'Size'}: ${print_size(line.size)}`);
        set_innerText('bcr_demand',     `${line.demand.supplier.name} - ${print_date(line.demand.createdAt)}`);
        set_innerText('line_item',      line.size.item.description);
        set_innerText('line_size',      print_size(line.size));
        set_innerText('line_qty',       line.qty);
        set_innerText('line_user',      print_user(line.user));
        set_innerText('line_createdAt', print_date(line.createdAt, true));
        set_innerText('line_updatedAt', print_date(line.updatedAt, true));
        set_innerText('line_status',    line_statuses[line.status]);
        set_href('bcr_demand',       `/demands/${line.demand_id}`);
        set_href('line_user_link',   `/users/${line.user_id}`);
        set_href('line_item_link',   `/items/${line.size.item_id}`);
        set_href('line_size_link',   `/sizes/${line.size_id}`);
        set_href('line_serial_link', (line.serial ? `/serials/${line.serial_id}`: ''));
    });
};
window.addEventListener('load', function () {
    addListener('reload', getDemandLine);
});