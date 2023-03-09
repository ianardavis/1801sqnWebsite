function getReceiptStocks() {
    clear('receipt_stock')
    .then(receipt_qty => {
        get({
            table: 'stocks',
            where: {size_id: path[2]}
        })
        .then(function ([result, options]) {
            result.stocks.forEach(stock => {
                receipt_qty.appendChild(new Option({value: stock.stock_id, text: stock.location.location}).e);
            });
        });
    })
}
window.addEventListener( "load", function () {
    enable_button('receipt_add');
    enable_button('stock_add');
    modalOnShow('stock_add',   getLocations);
    modalOnShow('receipt_add', getReceiptStocks);
    addFormListener(
        'stock_add',
        'POST',
        '/stocks',
        {onComplete: getStocks}
    );
    addFormListener(
        'receipt_add',
        'POST',
        '/stocks/receipts',
        {onComplete: getStocks}
    );
    add_listener('reload_locations_stock',   getLocations);
    add_listener('reload_locations_receipt', getReceiptStocks);
});