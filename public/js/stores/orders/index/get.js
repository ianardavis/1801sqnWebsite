var lines_loaded = {'0': false, '1': false, '2': false, '3': false};
function getOrders(status) {
    lines_loaded[status] = false;
    get(
        function (orders, options) {
            set_count({id: `status_${status}`, count: orders.length || 0});
            let tbl = document.querySelector(`#tbl_orders_${status}`);
            if (tbl) {
                tbl.innerHTML = '';
                orders.forEach(order => {
                    let row = tbl.insertRow(-1);
                    add_cell(row, {
                        sort: print_date(order.createdAt),
                        text: new Date(order.createdAt).toDateString()
                    });
                    add_cell(row, {text: order.size.item._description});
                    add_cell(row, {text: order.size._size});
                    add_cell(row, {text: order._qty});
                    if (status === '1') {
                        let div = new Div().e;
                        div.appendChild(new Select({
                            small:      true,
                            options:    [new Option({text: '... Select', selected: true}).e],
                            attributes: [
                                {field: 'name', value: `lines[${order.order_id}][_status]`},
                                {field: 'id'  , value: `sel_action_${order.order_id}`}
                            ]
                        }).e);
                        div.appendChild(new Hidden({
                            attributes: [
                                {field: 'name',  value: `lines[${order.order_id}][order_id]`},
                                {field: 'value', value: order.order_id}
                            ]
                        }).e)
                        add_cell(row, {
                            append: div,
                            classes: [`actions-${status}`],
                            data: {
                                field: 'order_id',
                                value: order.order_id
                            }
                        });
                    };
                    add_cell(row, {append: new Link({href: `/stores/orders/${order.order_id}`, small: true}).e});
                });
            };
            lines_loaded[status] = true;
            if (status === '1' && typeof getPlacedActions === 'function') getPlacedActions();
        },
        {
            table: 'orders',
            query: [`_status=${status}`],
            spinner: `status_${status}`
        }
    );
};
function loadAll() {
    getOrders('0');
    getOrders('1');
    getOrders('2');
    getOrders('3');
};
window.addEventListener('load', function () {
    document.querySelector('#reload').addEventListener('click', loadAll);
});