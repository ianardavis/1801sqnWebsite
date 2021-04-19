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
                        modal: 'stock_view',
                        data:  {field: 'stock_id', value: stock.stock_id},
                        small: true
                    }).e}
                    );
                } catch (error) {console.log(error)};
            });
        });
    })
    .catch(err => console(err));
};
function viewStock(stock_id) {
    get({
        table: 'stock',
        query: [`stock_id=${stock_id}`],
        spinner: 'stock_view'
    })
    .then(function([stock, options]) {
        set_innerText({id: 'stock_location',       text: stock.location.location});
        set_innerText({id: 'qty',                  text: stock.qty});
        set_innerText({id: 'stock_id',             text: stock.stock_id});
        set_attribute({id: 'btn_stock_adjust_add', attribute: 'data-stock_id', value: stock.stock_id});
        set_attribute({id: 'btn_stock_link',       attribute: 'href', value: `/stocks/${stock.stock_id}`});
    });
};
addReloadListener(getStocks);
window.addEventListener('load', function () {
    $('#mdl_stock_view').on('show.bs.modal', function (event) {viewStock(event.relatedTarget.dataset.stock_id)});
});