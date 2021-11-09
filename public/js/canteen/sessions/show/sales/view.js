let sale_statuses = {'0': 'Cancelled', '1': 'Open', '2': 'Complete'}
function getSales() {
    clear('tbl_items')
    .then(tbl_items => {
        clear('tbl_sales')
        .then(tbl_sales => {
            let sort_cols = tbl_sales.parentNode.querySelector('.sort') || null;
            get({
                table: 'sales',
                query: [`"session_id":"${path[2]}"`],
                ...sort_query(sort_cols)
            })
            .then(function ([sales, options]) {
                set_count({id: 'sale', count: sales.length || '0'});
                let items = [], takings = 0.00;
                sales.forEach(sale => {
                    let row = tbl_sales.insertRow(-1);
                    add_cell(row, {text: print_time(sale.createdAt)});
                    add_cell(row, {text: print_user(sale.user)});
                    add_cell(row, {text: sale.lines.length});
                    add_cell(row, {text: sale_statuses[sale.status] || 'Unknown'});
                    add_cell(row,{
                        append: new Link({
                            href: `/sales/${sale.sale_id}`,
                            small: true
                        }).e
                    });
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
                set_innerText({id: 'session_takings', value: `£${Number(takings).toFixed(2)}`});
                set_count({id: 'item', count: items.length || '0'});
                items.forEach(item => {
                    let row = tbl_items.insertRow(-1);
                    add_cell(row, {text: item.name});
                    add_cell(row, {text: item.sales});
                    add_cell(row, {text: item.qty});
                    add_cell(row,{
                        append: new Link({
                            href: `/canteen_items/${item.item_id}`,
                            small: true
                        }).e
                    });
                });
            });
        });
    });
};
addReloadListener(getSales);