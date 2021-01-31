function getAdjusts(event) {
    get(
        function(adjusts, options) {
            let tbl_adjusts = document.querySelector('#tbl_adjusts');
            if (tbl_adjusts) {
                tbl_adjusts.innerHTML = '';
                set_count({id: 'stock_adjusts', count: adjusts.length});
                adjusts.forEach(adjust => {
                    try {
                        let row = tbl_adjusts.insertRow(-1);
                        add_cell(row, table_date(adjust.createdAt, true));
                        add_cell(row, {text: adjust._type});
                        add_cell(row, {text: adjust._qty});
                        add_cell(row, {text: adjust._variance});
                    } catch (error) {
                        console.log(error);
                    };
                });
            }
        },
        {
            table: 'adjusts',
            query: [`stock_id=${event.relatedTarget.dataset.stock_id}`],
            spinner: 'stock_adjusts'
        }
    );
};
window.addEventListener('load', function () {
    $('#mdl_stock_view').on('show.bs.modal', getAdjusts);
});