function getStocks() {
    clear('tbl_stocks')
    .then(tbl_stocks => {
        function add_line(stock) {
            let row = tbl_stocks.insertRow(-1);
            addCell(row, {text: stock.size.item.description});
            addCell(row, {text: printSize(stock.size)});
            addCell(row, {text: stock.qty || '0'});
            addCell(row, {append: new Modal_Button(
                _search(),
                'stock_view',
                [{field: 'id', value: stock.stock_id}]
            ).e});
        };
        get({
            table: 'stocks',
            where: {location_id: path[2]},
            func: getStocks
        })
        .then(function ([result, options]) {
            setCount('stock', result.count);
            result.stocks.forEach(stock => {
                add_line(stock);
            });
        });
    });
};
function viewStock(stock_id) {
    function display_details([stock, options]) {
        setInnerText('stock_id',        stock.stock_id);
        setInnerText('stock_item',      stock.size.item.description);
        setInnerText('stock_size',      printSize(stock.size));
        setInnerText('stock_qty',       stock.qty);
        setInnerText('stock_createdAt', printDate(stock.createdAt, true));
        setInnerText('stock_updatedAt', printDate(stock.updatedAt, true));
        return stock;
    };
    function set_links(stock) {
        setHREF('stock_item_link', `/items/${stock.size.item_id}`);
        setHREF('stock_size_link', `/sizes/${stock.size_id}`);
        setHREF('btn_stock_link',  `/stocks/${stock.stock_id}`);
        return stock;
    };
    get({
        table: 'stock',
        where: {stock_id: stock_id}
    })
    .then(display_details)
    .then(set_links);
};
window.addEventListener('load', function () {
    modalOnShow('stock_view', function (event) {viewStock(event.relatedTarget.dataset.id)});
});