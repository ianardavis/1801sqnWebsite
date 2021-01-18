function getReceipts() {
    get(
        function (lines, options) {
            try {
                let tbl_receipts = document.querySelector('#tbl_receipts');
                    set_count({id: 'receipt', count: lines.length || '0'})
                if (tbl_receipts) {
                    tbl_receipts.innerHTML = '';
                    lines.forEach(line => {
                        let row = tbl_receipts.insertRow(-1);
                        add_cell(row, table_date(line.createdAt));
                        add_cell(row, {text: line._qty});
                        add_cell(row, {append: new Link({
                            href: `/canteen/receipts/${line.receipt_id}`,
                            small: true
                        }).e});
                    });
                };
            } catch (error) {
                console.log(error);
            };
        },
        {
            db: 'canteen',
            table: 'receipt_lines',
            query: [`item_id=${path[3]}`]
        }
    )
};
document.querySelector('#reload').addEventListener('click', getReceipts);