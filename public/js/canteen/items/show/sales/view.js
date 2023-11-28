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
                    addCell(row, tableDate(line.createdAt));
                    addCell(row, {text: line.qty});
                    addCell(row, {append: new Link(`/sales/${line.sale_id}`).e});
                } catch (error) {
                    console.error(`canteen/items/show/sales/view.js | getSales | ${error}`);
                };
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getSales);
    addSortListeners('sale_lines', getSales);
    getSales();
});