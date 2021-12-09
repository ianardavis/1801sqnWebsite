function getStocks() {
    clear('tbl_stocks')
    .then(tbl_stocks => {
        let sort_cols = tbl_stocks.parentNode.querySelector('.sort') || null;
        get({
            table: 'stocks',
            query: [`"location_id":"${path[2]}"`],
            ...sort_query(sort_cols)
        })
        .then(function ([stocks, options]) {
            set_count('stock', stocks.length || '0');
            stocks.forEach(stock => {
                let row = tbl_stocks.insertRow(-1);
                add_cell(row, {text: stock.size.item.description});
                add_cell(row, {text: print_size(stock.size)});
                add_cell(row, {text: stock.qty || '0'});
                add_cell(row, {append: new Button({
                    modal: 'stock_view',
                    data: [{field: 'id', value: stock.stock_id}],
                    small: true
                }).e});
            });
        });
    });
};
function viewStock(stock_id) {
    get({
        table: 'stock',
        query: [`"stock_id":"${stock_id}"`]
    })
    .then(function ([stock, options]) {
        set_innerText('stock_id',        stock.stock_id);
        set_innerText('stock_item',      stock.size.item.description);
        set_innerText('stock_size',      print_size(stock.size));
        set_innerText('stock_qty',       stock.qty);
        set_innerText('stock_createdAt', print_date(stock.createdAt, true));
        set_innerText('stock_updatedAt', print_date(stock.updatedAt, true));
        set_href('stock_item_link', `/items/${stock.size.item_id}`);
        set_href('stock_size_link', `/sizes/${stock.size_id}`);
        set_href('btn_stock_link',  `/stocks/${stock.stock_id}`);
    })
};
window.addEventListener('load', function () {
    modalOnShow('stock_view', function (event) {viewStock(event.relatedTarget.dataset.id)});
});