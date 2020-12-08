function getReceipts() {
    get(
        function (lines, options) {
            try {
                clearElement('tbl_receipts');
                let tbl_receipts  = document.querySelector('#tbl_receipts'),
                    receipt_count = document.querySelector('#receipt_count');
                receipt_count.innerText = lines.length || '0';
                lines.forEach(line => {
                    let row = tbl_receipts.insertRow(-1);
                    add_cell(row, {
                        sort: new Date(line.createdAt).getTime(),
                        text: print_date(line.createdAt)
                    });
                    add_cell(row, {text: line._qty});
                    add_cell(row, {append: new Link({
                        href: `/canteen/receipts/${line.receipt_id}`,
                        small: true
                    }).e});
                });
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