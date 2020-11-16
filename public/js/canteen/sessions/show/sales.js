function showSales(sales, options) {
    let tbl_sales  = document.querySelector('#tbl_sales'),
        tbl_items  = document.querySelector('#tbl_items'),
        sale_count = document.querySelector('#sale_count'),
        item_count = document.querySelector('#item_count'),
        items      = [];
    tbl_items.innerHTML = '';
    tbl_sales.innerHTML = '';
    sale_count.innerText = sales.length || '0';
    sales.forEach(sale => {
        let row = tbl_sales.insertRow(-1);
        add_cell(row, {text: print_date(sale.createdAt ,true)});
        add_cell(row, {text: print_user(sale.user ,true)});
        add_cell(row, {text: sale.lines.length});
        if      (sale._status === 0) add_cell(row, {text: 'Cancelled'})
        else if (sale._status === 1) add_cell(row, {text: 'Open'})
        else if (sale._status === 2) add_cell(row, {text: 'Complete'})
        else    add_cell(row, {text: 'Unknown'});
        add_cell(row,{
            append: new Link({
                href: `/canteen/sales/${sale.sale_id}`,
                small: true
            }).e
        });
        sale.lines.forEach(line => {
            let current = items.find(e => e.item_id === line.item_id);
            if (current) {
                current.qty += line._qty;
                current.sales += 1;
            } else {
                items.push({
                    item_id: line.item_id,
                    name:    line.item._name,
                    qty:     line._qty,
                    sales:   1
                })
            };
        });
    });
    item_count.innerText = items.length || '0';
    items.forEach(item => {
        let row = tbl_items.insertRow(-1);
        add_cell(row, {text: item.name});
        add_cell(row, {text: item.sales});
        add_cell(row, {text: item.qty});
        add_cell(row,{
            append: new Link({
                href: `/canteen/items/${item.item_id}`,
                small: true
            }).e
        });
    });
};