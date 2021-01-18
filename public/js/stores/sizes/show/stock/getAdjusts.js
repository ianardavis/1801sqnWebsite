let sel_stock_adjust_type = document.querySelector('#sel_stock_adjust_type') || {value: ''};
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
                        add_cell(row, table_date(adjust.createdAt, true));
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
            query: [`stock_id=${stock_id}`, sel_stock_adjust_type.value],
            spinner: 'stock_adjusts'
        }
    );
};
$('#mdl_stock_view').on('show.bs.modal', function(event) {getStockAdjusts(event.relatedTarget.dataset.stock_id)});
window.addEventListener('load', function () {
    sel_stock_adjust_type.addEventListener('change', function () {getStockAdjusts(stock_id.innerText)});
    stock_reload.addEventListener(         'click',  function () {getStockAdjusts(stock_id.innerText)});
});