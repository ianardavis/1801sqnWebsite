function getStocks() {
    clear_table('stocks')
    .then(tbl_stocks => {
        get({
            table: 'stocks',
            query: [`location_id=${path[2]}`]
        })
        .then(function ([stocks, options]) {
            set_count({id: 'stock', count: stocks.length || '0'});
            stocks.forEach(stock => {
                let row = tbl_stocks.insertRow(-1);
                add_cell(row, {text: stock.size.item.description});
                add_cell(row, {text: stock.size.size});
                add_cell(row, {text: stock.qty || '0'});
                add_cell(row, {append: new Button({
                    modal: 'stock_view',
                    data: {field: 'id', value: stock.stock_id},
                    small: true
                }).e});
            });
        });
    });
};
function viewStock(stock_id) {
    get({
        table: 'stock',
        query: [`stock_id=${stock_id}`]
    })
    .then(function ([stock, options]) {
        set_innerText({id: 'stock_id',        text: stock.stock_id});
        set_innerText({id: 'stock_item',      text: stock.size.item.description});
        set_innerText({id: 'stock_size',      text: stock.size.size});
        set_innerText({id: 'stock_qty',       text: stock.qty});
        set_innerText({id: 'stock_createdAt', text: print_date(stock.createdAt, true)});
        set_innerText({id: 'stock_updatedAt', text: print_date(stock.updatedAt, true)});
        set_href({id: 'stock_item_link', value: `/items/${stock.size.item_id}`});
        set_href({id: 'stock_size_link', value: `/sizes/${stock.size_id}`});
        set_href({id: 'btn_stock_link',  value: `/stocks/${stock.stock_id}`});
    })
};
window.addEventListener('load', function () {
    $('#mdl_stock_view').on('show.bs.modal', function (event) {viewStock(event.relatedTarget.dataset.id)});
});