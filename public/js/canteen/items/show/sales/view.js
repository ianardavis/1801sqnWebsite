function getSales() {
    clear('tbl_sales')
    .then(tbl_sales => {
        get({
            table: 'sale_lines',
            where: {item_id: path[2]},
            func: getSales
        })
        .then(function ([result, options]) {
            set_count('sale', result.count);
            result.lines.forEach(line => {
                try {
                    let row = tbl_sales.insertRow(-1);
                    add_cell(row, table_date(line.createdAt));
                    add_cell(row, {text: line.qty});
                    add_cell(row, {append: new Link(`/sales/${line.sale_id}`).e});
                } catch (error) {
                    console.log(error);
                };
            });
        });
    });
};
addReloadListener(getSales);
window.addEventListener('load', function () {
    add_sort_listeners('sale_lines', getSales);
    getSales();
});