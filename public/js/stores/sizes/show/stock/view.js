function getStocks() {
    clear_table('stocks')
    .then(tbl_stocks => {
        get({
            table: 'stocks',
            query: [`size_id=${path[2]}`]
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
    })
    .catch(err => console(err));
};
addReloadListener(getStocks);