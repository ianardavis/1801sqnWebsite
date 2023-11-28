function getStocks() {
    clear('tbl_stocks')
    .then(tbl_stocks => {
        get({
            table: 'stocks',
            where: {size_id: path[2]},
            func: getStocks
        })
        .then(function ([result, options]) {
            setCount('stock', result.count);
            result.stocks.forEach(stock => {
                try {
                    let row = tbl_stocks.insertRow(-1);
                    addCell(row, {text: stock.location.location});
                    addCell(row, {text: stock.qty || '0'});
                    addCell(row, {append: new Link(`/stocks/${stock.stock_id}`).e});
                    
                } catch (error) {
                    console.error(error);

                };
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getStocks);
    addSortListeners('stocks', getStocks);
    getStocks();
});