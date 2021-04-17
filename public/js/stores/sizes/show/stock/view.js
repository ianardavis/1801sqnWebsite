function getStocks() {
    get(
        {
            table: 'stocks',
            query: [`size_id=${path[2]}`]
        },
        function (stocks, options) {
            set_count({id: 'stock', count: stocks.length || '0'});
            let tbl_stock = document.querySelector('#tbl_stock');
            if (tbl_stock) {
                tbl_stock.innerHTML = '';
                stocks.forEach(stock => {
                    try {
                        let row = tbl_stock.insertRow(-1);
                        add_cell(row, {text: stock.location._location});
                        add_cell(row, {text: stock._qty || '0'});
                        add_cell(row, {append: new Link({
                            modal: 'stock_view',
                            data:  {field: 'stock_id', value: stock.stock_id},
                            small: true
                        }).e}
                        );
                    } catch (error) {console.log(error)};
                });
            };
        }
    );
};
function viewStock(event) {
    get(
        {
            table: 'stock',
            query: [`stock_id=${event.relatedTarget.dataset.stock_id}`],
            spinner: 'stock_view'
        },
        function(stock, options) {
            let stock_ids = document.querySelectorAll('.stock_id');
            if (stock_ids) stock_ids.forEach(e => e.setAttribute('value', stock.stock_id));
            set_innerText({id: 'stock_location',       text: stock.location._location});
            set_innerText({id: '_qty',                 text: stock._qty});
            set_innerText({id: 'stock_id',             text: stock.stock_id});
            set_attribute({id: 'btn_stock_adjust_add', attribute: 'data-stock_id', value: stock.stock_id});
            set_attribute({id: 'btn_stock_link',       attribute: 'href', value: `/stocks/${stock.stock_id}`});
        }
    );
};
window.addEventListener('load', function () {
    $('#mdl_stock_view').on('show.bs.modal', viewStock);
    document.querySelector('#reload').addEventListener('click', getStocks);
});