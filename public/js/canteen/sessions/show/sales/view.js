let sale_statuses = {'0': 'Cancelled', '1': 'Open', '2': 'Complete'}
function getSales() {
    clear('tbl_items')
    .then(tbl_items => {
        clear('tbl_sales')
        .then(tbl_sales => {
            get({
                table: 'sales',
                where: {session_id: path[2]},
                func:  getSales
            })
            .then(function ([results, options]) {
                set_count('sale', results.sales.length);
                let items = [], takings = 0.00;
                results.sales.forEach(sale => {
                    let row = tbl_sales.insertRow(-1);
                    add_cell(row, {text: print_time(sale.createdAt)});
                    add_cell(row, {text: print_user(sale.user)});
                    add_cell(row, {text: sale.lines.length});
                    add_cell(row, {text: sale_statuses[sale.status] || 'Unknown'});
                    add_cell(row, {append: new Link({href: `/sales/${sale.sale_id}`}).e});
                    sale.lines.forEach(line => {
                        takings += (line.qty * line.item.price);
                        let current = items.find(e => e.item_id === line.item_id);
                        if (current) {
                            current.qty += line.qty;
                            current.sales += 1;
                        } else {
                            items.push({
                                item_id: line.item_id,
                                name:    line.item.name,
                                qty:     line.qty,
                                sales:   1
                            })
                        };
                    });
                });
                set_innerText('session_takings', `£${Number(takings).toFixed(2)}`);
                set_count('item', items.length);
                items.forEach(item => {
                    let row = tbl_items.insertRow(-1);
                    add_cell(row, {text: item.name});
                    add_cell(row, {text: item.sales});
                    add_cell(row, {text: item.qty});
                    add_cell(row, {append: new Link({href: `/canteen_items/${item.item_id}`}).e});
                });
            });
        });
    });
};
addReloadListener(getSales);
sort_listeners(
    'sales',
    getSales,
    [
        {value: '["createdAt"]', text: 'Time', selected: true},
        {value: '["qty"]',       text: 'Qty'},
        {value: '["status"]',    text: 'Status'}
    ]
);