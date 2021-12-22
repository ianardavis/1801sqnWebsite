function getSaleLines() {
    clear('tbl_lines')
    .then(tbl_lines => {
        get({
            table: 'sale_lines',
            where: {sale_id: path[2]},
            func: getSaleLines
        })
        .then(function ([result, options]) {
            set_count('line', result.count);
            result.lines.forEach(line => {
                try {
                    let row = tbl_lines.insertRow(-1);
                    add_cell(row, table_date(line.createdAt));
                    add_cell(row, {text: line.item.name});
                    add_cell(row, {text: line.qty});
                    add_cell(row, {text: `£${Number(line.item.price).toFixed(2)}`});
                    add_cell(row, {text: `£${Number(line.item.price*line.qty).toFixed(2)}`});
                } catch (error) {
                    console.log(error);
                };
            });
        });
    });
};
addReloadListener(getSaleLines);