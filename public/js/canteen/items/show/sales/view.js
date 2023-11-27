function getSales() {
    clear('tbl_sales')
    .then(tbl_sales => {
        get({
            table: 'sale_lines',
            where: {item_id: path[2]},
            func: getSales
        })
        .then(function ([result, options]) {
            setCount('sale', result.count);
            result.lines.forEach(line => {
                try {
                    let row = tbl_sales.insertRow(-1);
                    add_cell(row, table_date(line.createdAt));
                    add_cell(row, {text: line.qty});
                    add_cell(row, {append: new Link(`/sales/${line.sale_id}`).e});
                } catch (error) {
                    console.error(`canteen/items/show/sales/view.js | getSales | ${error}`);
                };
            });
        });
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getSales);
    add_sort_listeners('sale_lines', getSales);
    getSales();
});