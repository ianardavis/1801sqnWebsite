function getStocks() {
    clear('tbl_stocks')
    .then(tbl_stocks => {
        let sort_cols = tbl_stocks.parentNode.querySelector('.sort') || null;
        get({
            table: 'stocks',
            query: [`size_id=${path[2]}`],
            sort:  (sort_cols ? {col: sort_cols.dataset.sort_col, dir: sort_cols.dataset.sort_dir} : null)
        })
        .then(function ([stocks, options]) {
            set_count({id: 'stock', count: stocks.length || '0'});
            stocks.forEach(stock => {
                try {
                    let row = tbl_stocks.insertRow(-1);
                    add_cell(row, {text: stock.location.location});
                    add_cell(row, {text: stock.qty || '0'});
                    add_cell(row, {append: new Link({
                        href: `/stocks/${stock.stock_id}`,
                        small: true
                    }).e}
                    );
                } catch (error) {console.log(error)};
            });
        });
    });
};
addReloadListener(getStocks);