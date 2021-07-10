let order_statuses = {'0': 'Cancelled', '1': 'Placed', '2': 'Demanded', '3': 'Received'};
function getOrders() {
    clear('tbl_orders')
    .then(tbl_orders => {
        let statuses = document.querySelectorAll("input[type='checkbox']:checked") || [],
            query = [];
        statuses.forEach(e => query.push(e.value));
        get({
            table: 'orders',
            query: [query.join('&')]
        })
        .then(function ([orders, options]) {
            let row_index = 0;
            orders.forEach(order => {
                let row = tbl_orders.insertRow(-1);
                add_cell(row, table_date(order.createdAt));
                add_cell(row, {text: order.size.item.description});
                add_cell(row, {text: order.size.size});
                add_cell(row, {text: order.qty});
                add_cell(row, {
                    text: order_statuses[order.status] || 'Unknown',
                    ...(
                        order.status === 1 ?
                        {
                            classes: ['actions'],
                            data:    [
                                {field: 'id',    value: order.order_id},
                                {field: 'index', value: row_index}
                            ]
                        } : {}
                    )
                });
                add_cell(row, {append: new Link({
                    href: `/orders/${order.order_id}`,
                    small: true
                }).e})
                row_index ++;
            });
            if (typeof addEditSelect === 'function') addEditSelect();
            return tbl_orders;
        })
        .then(tbl_orders => filter(tbl_orders));
    });
};
function filter(tbl_orders) {
    if (!tbl_orders) tbl_orders = document.querySelector('#tbl_orders');
    let from = new Date(document.querySelector('#createdAt_from').value).getTime() || '',
        to   = new Date(document.querySelector('#createdAt_to').value)  .getTime() || '',
        item = document.querySelector('#item').value.trim() || '',
        size = document.querySelector('#size').value.trim() || '';
    tbl_orders.childNodes.forEach(row => {
        if (
            (!from || row.childNodes[0].dataset.sort > from) &&
            (!to   || row.childNodes[0].dataset.sort < to)   &&
            (!item || row.childNodes[1].innerText.toLowerCase().includes(item.toLowerCase())) &&
            (!size || row.childNodes[2].innerText.toLowerCase().includes(size.toLowerCase()))
        )    row.classList.remove('hidden')
        else row.classList.add(   'hidden');
    });
};
addReloadListener(getOrders);
window.addEventListener('load', function () {
    addListener('sel_status', getOrders, 'change');
    addListener('status_0',   getOrders, 'change');
    addListener('status_1',   getOrders, 'change');
    addListener('status_2',   getOrders, 'change');
    addListener('status_3',   getOrders, 'change');
    addListener('createdAt_from', function (){filter()}, 'change');
    addListener('createdAt_to',   function (){filter()}, 'change');
    addListener('item',           function (){filter()}, 'input');
    addListener('size',           function (){filter()}, 'input');
});
