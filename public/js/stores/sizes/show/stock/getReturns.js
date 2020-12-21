function getStockReturns(stock_id) {
    get(
        function(lines, options) {
            let tbl_stock_returns = document.querySelector('#tbl_stock_returns');
            if (tbl_stock_returns) {
                tbl_stock_returns.innerHTML = '';
                set_count({id: 'stock_returns', count: lines.length});
                lines.forEach(line => {
                    try {
                        let row = tbl_stock_returns.insertRow(-1);
                        add_cell(row, {
                            text: print_date(line.createdAt, true),
                            sort: new Date (line.createdAt).getTime()
                        });
                        add_cell(row, {text: print_user(line.issue.user_to)});
                        add_cell(row, {text: line._qty});
                        add_cell(row, {append:
                            new Link({
                                href: `/stores/returns/${line.return_id}`,
                                small: true
                            }).e
                        });
                    } catch (error) {
                        console.log(error);
                    };
                });
            }
        },
        {
            table: 'issue_line_returns',
            query: [`stock_id=${stock_id}`],
            spinner: 'stock_returns'
        }
    );
};
$('#mdl_stock_view').on('show.bs.modal', function(event) {getStockReturns(event.relatedTarget.dataset.stock_id)});
window.addEventListener('load', function () {
    stock_reload.addEventListener('click', function () {
        getStockReturns(stock_id.innerText);
    });
});