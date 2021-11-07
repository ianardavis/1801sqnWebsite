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
            set_count({id: 'stock', count: stocks.length || '0'});
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
        set_innerText({id: 'stock_id',        text: stock.stock_id});
        set_innerText({id: 'stock_item',      text: stock.size.item.description});
        set_innerText({id: 'stock_size',      text: print_size(stock.size)});
        set_innerText({id: 'stock_qty',       text: stock.qty});
        set_innerText({id: 'stock_createdAt', text: print_date(stock.createdAt, true)});
        set_innerText({id: 'stock_updatedAt', text: print_date(stock.updatedAt, true)});
        set_href({id: 'stock_item_link', value: `/items/${stock.size.item_id}`});
        set_href({id: 'stock_size_link', value: `/sizes/${stock.size_id}`});
        set_href({id: 'btn_stock_link',  value: `/stocks/${stock.stock_id}`});
    })
};
window.addEventListener('load', function () {
    modalOnShow('stock_view', function (event) {viewStock(event.relatedTarget.dataset.id)});
});