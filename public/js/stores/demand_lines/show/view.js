let line_statuses = {"0": "Cancelled", "1": "Pending", "2": "Open", "3": "Closed"};
function getDemandLine() {
    get({
        table: 'demand_line',
        query: [`demand_line_id=${path[2]}`]
    })
    .then(function ([line, options]) {
        console.log(line);
        set_breadcrumb({text: `${line.size.item.description} | ${line.size.item.size_text1 || 'Size'}: ${print_size(line.size)}`});
        set_innerText({id: 'bcr_demand',     text: `${line.demand.supplier.name} - ${print_date(line.demand.createdAt)}`});
        set_innerText({id: 'line_item',      text: line.size.item.description});
        set_innerText({id: 'line_size',      text: print_size(line.size)});
        set_innerText({id: 'line_qty',       text: line.qty});
        set_innerText({id: 'line_user',      text: print_user(line.user)});
        set_innerText({id: 'line_createdAt', text: print_date(line.createdAt, true)});
        set_innerText({id: 'line_updatedAt', text: print_date(line.updatedAt, true)});
        set_innerText({id: 'line_status',    text: line_statuses[line.status]});
        set_href({id: 'bcr_demand',       value: `/demands/${line.demand_id}`});
        set_href({id: 'line_user_link',   value: `/users/${line.user_id}`});
        set_href({id: 'line_item_link',   value: `/items/${line.size.item_id}`});
        set_href({id: 'line_size_link',   value: `/sizes/${line.size_id}`});
        set_href({id: 'line_serial_link', value: (line.serial ? `/serials/${line.serial_id}`: '')});
    });
};
addReloadListener(getDemandLine);