function getSaleLines() {
    clear('tbl_lines')
    .then(tbl_lines => {
        get({
            table: 'sale_lines',
            where: {sale_id: path[2]},
            func: getSaleLines
        })
        .then(function ([result, options]) {
            setCount('line', result.count);
            result.lines.forEach(line => {
                try {
                    let row = tbl_lines.insertRow(-1);
                    addCell(row, tableDate(line.createdAt));
                    addCell(row, {text: line.item.name});
                    addCell(row, {text: line.qty});
                    addCell(row, {text: `£${Number(line.item.price).toFixed(2)}`});
                    addCell(row, {text: `£${Number(line.item.price*line.qty).toFixed(2)}`});
                } catch (error) {
                    console.error(`canteen/sales/show/lines/view.js | getSaleLines | ${error}`);
                };
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getSaleLines);
});