function getStockAdjusts(stock_id) {
    get(
        function(adjusts, options) {
            let tbl_stock_adjusts = document.querySelector('#tbl_stock_adjusts');
            if (tbl_stock_adjusts) {
                tbl_stock_adjusts.innerHTML = '';
                set_count({id: 'stock_adjusts', count: adjusts.length});
                adjusts.forEach(adjust => {
                    try {
                        let row = tbl_stock_adjusts.insertRow(-1);
                        add_cell(row, {
                            text: print_date(adjust.createdAt, true),
                            sort: new Date (adjust.createdAt).getTime()
                        });
                        add_cell(row, {text: adjust._type});
                        add_cell(row, {text: adjust._qty});
                        add_cell(row, {text: adjust._variance});
                        add_cell(row, {text: print_user(adjust.user)});
                    } catch (error) {
                        console.log(error);
                    };
                });
            }
        },
        {
            table: 'adjusts',
            query: [`stock_id=${stock_id}`],
            spinner: 'stock_adjusts'
        }
    );
};
$('#mdl_stock_view').on('show.bs.modal', function(event) {getStockAdjusts(event.relatedTarget.dataset.stock_id)});
window.addEventListener('load', function () {
    stock_reload.addEventListener('click', function () {
        getStockAdjusts(stock_id.innerText);
    });
});