function getReceipts() {
    get(
        function (lines, options) {
            let table_body = document.querySelector('#tbl_receipts');
            set_count({id: 'receipt', count: lines.length});
            if (table_body) {
                table_body.innerHTML = '';
                lines.forEach(line => {
                    try {
                        let row = table_body.insertRow(-1);
                        add_cell(row, {
                            sort: print_date(line.receipt.createdAt),
                            text: new Date(line.receipt.createdAt).toDateString()
                        });
                        if      (line.stock)  add_cell(row, {text: line.stock.location._location})
                        else if (line.serial) add_cell(row, {text: line.serial.location._location})
                        else add_cell(row, {text: 'Unknown'});
                        add_cell(row, {text: line._qty});
                        add_cell(row, {append: new Link({
                            href: `/stores/receipts/${line.receipt_id}`,
                            small: true
                        }).e});
                    } catch (error) {
                        console.log(error);
                    };
                });
            };
        },
        {
            table: 'receipt_lines',
            query: [`size_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getReceipts);