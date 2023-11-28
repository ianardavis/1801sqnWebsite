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
                setCount('sale', results.sales.length);
                let items = [], takings = 0.00;
                results.sales.forEach(sale => {
                    let row = tbl_sales.insertRow(-1);
                    addCell(row, {text: printTime(sale.createdAt)});
                    addCell(row, {text: printUser(sale.user)});
                    addCell(row, {text: sale.lines.length});
                    addCell(row, {text: sale_statuses[sale.status] || 'Unknown'});
                    addCell(row, {append: new Link(`/sales/${sale.sale_id}`).e});
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
                setInnerText('session_takings', `£${Number(takings).toFixed(2)}`);
                setCount('item', items.length);
                items.forEach(item => {
                    let row = tbl_items.insertRow(-1);
                    addCell(row, {text: item.name});
                    addCell(row, {text: item.sales});
                    addCell(row, {text: item.qty});
                    addCell(row, {append: new Link(`/canteen_items/${item.item_id}`).e});
                });
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getSales);
    addSortListeners('sales', getSales);
    getSales();
});