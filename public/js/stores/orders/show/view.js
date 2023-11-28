const statuses = {
    0: 'Cancelled',
    1: 'Placed',
    2: 'Added to Demand',
    3: 'Received'
};
const demand_line_statuses = {
    0: 'Cancelled',
    1: 'Draft',
    2: 'Open',
    3: 'Received'
};
function getOrder() {
    function display_details([order, options]) {
        setBreadcrumb(order.order_id);
        setInnerText('order_size',      printSize(order.size));
        setInnerText('order_item',      order.size.item.description);
        setInnerText('order_qty',       order.qty);
        setInnerText('order_createdAt', printDate(order.createdAt, true));
        setInnerText('order_updatedAt', printDate(order.updatedAt, true));
        setInnerText('order_user',      printUser(order.user));
        return order;
    };
    function set_links(order) {
        setHREF('order_user_link', `/users/${order.user_id}`);
        setHREF('order_size_link', `/sizes/${order.size_id}`);
        setHREF('order_item_link', `/items/${order.size.item_id}`);
        return order;
    };
    function set_button_states(order) {
        if (typeof set_mark_as_options === 'function') set_mark_as_options(order.status);
        return order;
    };
    function set_status_badges(order) {
        clearStatuses(3, statuses);
        if ([0, 1, 2, 3].includes(order.status)) {
            if (order.status === 0) {
                set_badge(1, 'danger', 'Cancelled');
    
            } else {
                set_badge(1, 'success');
                if (order.status > 1) {
                    set_badge(2, 'success');
                };
                if (order.status > 2) {
                    set_badge(3, 'success');
                };
            };
        };
        return order;
    };
    function show_issues(order) {
        clear('tbl_order_issues')
        .then(tbl_order_issues => {
            order.issues.forEach(issue => {
                let row = tbl_order_issues.insertRow(-1);
                addCell(row, {text: printDate(issue.createdAt)});
                addCell(row, {text: printUser(issue.user_issue)});
                addCell(row, {text: issue.qty});
                addCell(row, {append: new Link(`/issues/${issue.issue_id}`).e});
            });
        });
        return order;
    };
    function show_demand_lines(order) {
        clear('tbl_order_demand_lines')
        .then(tbl_order_demand_lines => {
            order.demand_lines.forEach(line => {
                let row = tbl_order_demand_lines.insertRow(-1);
                addCell(row, {text: printDate(line.createdAt)});
                addCell(row, {text: demand_line_statuses[line.status]});
                addCell(row, {append: new Link(`/demand_lines/${line.line_id}`).e});
            });
        });
        return order;
    };

    disableButton('mark_as');
    for (let i=0; i<=5 ; i++) {
        disableButton(`mark_${i}`);
    };
    get({
        table: 'order',
        where: {order_id: path[2]}
    })
    .then(display_details)
    .then(set_links)
    .then(set_button_states)
    .then(set_status_badges)
    .then(show_issues)
    .then(show_demand_lines)
    .catch(err => redirectOnError(err, '/orders'));
};
window.addEventListener('load', function () {
    addListener('reload', getOrder);
    getOrder();
});