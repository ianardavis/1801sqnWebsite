function getSales() {
    clear('tbl_sales')
    .then(tbl_sales => {
        get({
            table: 'sale_lines',
            query: [`"item_id":"${path[2]}"`],
            ...sort_query(tbl_sales)
        })
        .then(function ([lines, options]) {
            set_count('sale', lines.length || '0');
            lines.forEach(line => {
                try {
                    let row = tbl_sales.insertRow(-1);
                    add_cell(row, table_date(line.createdAt));
                    add_cell(row, {text: line.qty});
                    add_cell(row, {append: new Link({href: `/sales/${line.sale_id}`}).e});
                } catch (error) {
                    console.log(error);
                };
            });
        });
    });
};
addReloadListener(getSales);