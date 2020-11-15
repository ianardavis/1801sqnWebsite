showReceipts = (lines, options) => {
    try {
        let table_body    = document.querySelector('#tbl_receipts'),
            receipt_count = document.querySelector('#receipt_count');
        receipt_count.innerText = lines.length || '0';
        table_body.innerHTML = '';
        lines.forEach(line => {
            let row = table_body.insertRow(-1);
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
        hide_spinner('receipt_lines');
    } catch (error) {
        console.log(error);
    };
};