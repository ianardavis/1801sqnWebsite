function getStockIssues(stock_id) {
    get(
        function(lines, options) {
            let tbl_stock_issues = document.querySelector('#tbl_stock_issues');
            if (tbl_stock_issues) {
                tbl_stock_issues.innerHTML = '';
                set_count({id: 'stock_issues', count: lines.length});
                lines.forEach(line => {
                    try {
                        let row = tbl_stock_issues.insertRow(-1);
                        add_cell(row, {
                            text: print_date(line.createdAt, true),
                            sort: new Date (line.createdAt).getTime()
                        });
                        add_cell(row, {text: print_user(line.issue.user_to)});
                        add_cell(row, {text: line._qty});
                        if (line.return) add_cell(row, {html: '<i class="fas fa-check"></i>'})
                        else             add_cell(row);
                        add_cell(row, {append:
                            new Link({
                                href: `/stores/issues/${line.issue_id}`,
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
            table: 'issue_lines',
            query: [`stock_id=${stock_id}`],
            spinner: 'stock_issues'
        }
    );
};
$('#mdl_stock_view').on('show.bs.modal', function(event) {getStockIssues(event.relatedTarget.dataset.stock_id)});