let line_statuses = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3": "Closed"};
function getLoancardLine() {
    get({
        table: 'loancard_line',
        query: [`loancard_line_id=${path[2]}`]
    })
    .then(function ([line, options]) {
        set_breadcrumb({text: line.loancard_line_id});
        set_innerText({id: 'bcr_loancard',   text: line.loancard_id});
        set_href({id: 'bcr_loancard', value: `/loancards/${line.loancard_id}`});
        set_innerText({id: 'line_item',      text: line.size.item.description});
        set_innerText({id: 'line_size',      text: line.size.size});
        set_innerText({id: 'line_qty',       text: line.qty});
        set_innerText({id: 'line_serial',    text: (line.serial ? line.serial.serial : '')});
        set_innerText({id: 'line_user',      text: print_user(line.user)});
        set_innerText({id: 'line_createdAt', text: print_date(line.createdAt, true)});
        set_innerText({id: 'line_updatedAt', text: print_date(line.updatedAt, true)});
        set_innerText({id: 'line_status',    text: line_statuses[line.status]});
        set_href({id: 'line_user_link', value: `/users/${line.user_id}`});
        set_href({id: 'line_item_link', value: `/items/${line.size.item_id}`});
        set_href({id: 'line_size_link', value: `/sizes/${line.size_id}`});
        set_href({id: 'line_serial_link', value: (line.serial ? `/serials/${line.serial_id}`: '')});
    });
};
addReloadListener(getLoancardLine);