function getSales() {
    clear('tbl_sales')
    .then(tbl_sales => {
        let sort_cols = tbl_sales.parentNode.querySelector('.sort') || null;
        get({
            table: 'sale_lines',
            query: [`"item_id":"${path[2]}"`],
            ...sort_query(sort_cols)
        })
        .then(function ([lines, options]) {
            set_count({id: 'sale', count: lines.length || '0'});
            lines.forEach(line => {
                try {
                    let row = tbl_sales.insertRow(-1);
                    add_cell(row, table_date(line.createdAt));
                    add_cell(row, {text: line.qty});
                    add_cell(row, {append: new Link({
                        href: `/sales/${line.sale_id}`,
                        small: true
                    }).e});
                } catch (error) {
                    console.log(error);
                };
            });
        });
    });
};
addReloadListener(getSales);