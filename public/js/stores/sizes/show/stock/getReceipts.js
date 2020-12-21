function getStockReceipts(stock_id) {
    get(
        function(lines, options) {
            let tbl_stock_receipts = document.querySelector('#tbl_stock_receipts');
            if (tbl_stock_receipts) {
                tbl_stock_receipts.innerHTML = '';
                set_count({id: 'stock_receipts', count: lines.length});
                lines.forEach(line => {
                    try {
                        let row = tbl_stock_receipts.insertRow(-1);
                        add_cell(row, {
                            text: print_date(line.createdAt, true),
                            sort: new Date (line.createdAt).getTime()
                        });
                        add_cell(row, {text: line._qty});
                        add_cell(row, {text: print_user(line.user)});
                        add_cell(row, {append:
                            new Link({
                                href: `/stores/receipts/${line.receipt_id}`,
                                small: true
                            }).e
                        });
                    } catch (error) {
                        console.log(error)
                    };
                });
            }
        },
        {
            table: 'receipt_lines',
            query: [`stock_id=${stock_id}`],
            spinner: 'stock_receipts'
        }
    );
};
$('#mdl_stock_view').on('show.bs.modal', function(event) {getStockReceipts(event.relatedTarget.dataset.stock_id)});
window.addEventListener('load', function () {
    stock_reload.addEventListener('click', function () {
        getStockReceipts(stock_id.innerText);
    });
});