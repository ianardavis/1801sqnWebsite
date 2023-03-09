const statuses = {0: 'Cancelled', 1: 'Placed', 2: 'Added to Demand', 3: 'Received'};
const demand_line_statuses = {0: 'Cancelled', 1: 'Draft', 2: 'Open', 3: 'Received'};
function getOrder() {
    disable_button('mark_as');
    for (let i=0; i<=5 ; i++) {
        disable_button(`mark_${i}`);
    };
    get({
        table: 'order',
        where: {order_id: path[2]}
    })
    .then(function ([order, options]) {
        set_breadcrumb(order.order_id);
        set_innerText('order_size',      print_size(order.size));
        set_innerText('order_item',      order.size.item.description);
        set_innerText('order_qty',       order.qty);
        set_innerText('order_createdAt', print_date(order.createdAt, true));
        set_innerText('order_updatedAt', print_date(order.updatedAt, true));
        set_innerText('order_user',      print_user(order.user));

        clear('tbl_order_issues')
        .then(tbl_order_issues => {
            order.issues.forEach(issue => {
                let row = tbl_order_issues.insertRow(-1);
                add_cell(row, {text: print_date(issue.createdAt)});
                add_cell(row, {text: print_user(issue.user_issue)});
                add_cell(row, {text: issue.qty});
                add_cell(row, {append: new Link(`/issues/${issue.issue_id}`).e});
            });
        });
        
        clear('tbl_order_demand_lines')
        .then(tbl_order_demand_lines => {
            order.demand_lines.forEach(line => {
                let row = tbl_order_demand_lines.insertRow(-1);
                add_cell(row, {text: print_date(line.createdAt)});
                add_cell(row, {text: demand_line_statuses[line.status]});
                add_cell(row, {append: new Link(`/demand_lines/${line.demand_line_id}`).e});
            });
        });

        set_href('order_user_link', `/users/${order.user_id}`);
        set_href('order_size_link', `/sizes/${order.size_id}`);
        set_href('order_item_link', `/items/${order.size.item_id}`);

        if (typeof set_mark_as_options === 'function') set_mark_as_options(order.status);

        set_status_badges(order.status);
    })
    .catch(err => window.location.href = '/orders');
};
function set_status_badges(status) {
    clear_statuses(3, statuses);
    if ([0, 1, 2, 3].includes(status)) {
        if (status === 0) {
            set_badge(1, 'danger', 'Cancelled');

        } else {
            set_badge(1, 'success');
            if (status > 1) {
                set_badge(2, 'success');
            };
            if (status > 2) {
                set_badge(3, 'success');
            };
        };
    };
};
window.addEventListener('load', function () {
    add_listener('reload', getOrder);
    getOrder();
});