function getStocks() {
    clear('tbl_stocks')
    .then(tbl_stocks => {
        get({
            table: 'stocks',
            where: {size_id: path[2]},
            func: getStocks
        })
        .then(function ([result, options]) {
            set_count('stock', result.count);
            result.stocks.forEach(stock => {
                try {
                    let row = tbl_stocks.insertRow(-1);
                    add_cell(row, {text: stock.location.location});
                    add_cell(row, {text: stock.qty || '0'});
                    add_cell(row, {append: new Link({href: `/stocks/${stock.stock_id}`}).e});
                } catch (error) {console.log(error)};
            });
        });
    });
};
addReloadListener(getStocks);
sort_listeners(
    'stocks',
    getStocks,
    [
        {value: 'createdAt',   text: 'Created', selected: true},
        {value: 'qty',         text: 'Qty'},
        {value: 'location_id', text: 'Location'}
    ]
);