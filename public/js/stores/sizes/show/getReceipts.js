function getReceipts() {
    get(
        function (lines, options) {
            try {
                clearElement('tbl_receipts');
                let table_body = document.querySelector('#tbl_receipts');
                set_count({id: 'receipt', count: lines.length});
                lines.forEach(line => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {
                        sort: print_date(line.receipt.createdAt),
                        text: new Date(line.receipt.createdAt).toDateString()
                    });
                    add_cell(row, {text: line.stock.location._location});
                    add_cell(row, {text: line._qty});
                    add_cell(row, {append: new Link({
                        href: `/stores/receipts/${line.receipt_id}`,
                        small: true
                    }).e});
                });
            } catch (error) {
                console.log(error);
            };
        },
        {
            table: 'receipt_lines',
            query: [`size_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getReceipts);