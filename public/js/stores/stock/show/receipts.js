showReceipts = (lines, options) => {
    try {
        clearElement('receiptTable');
        let table_body    = document.querySelector('#receiptTable'),
            receipt_count = document.querySelector('#receipt_count');
        receipt_count.innerText = lines.length || '0';
        lines.forEach(line => {
            let row = table_body.insertRow(-1);
            add_cell(row, table_date(line.receipt.createdAt));
            add_cell(row, {text: line.stock.location._location});
            add_cell(row, {text: line._qty});
            add_cell(row, {append: new Link({
                href: '/stores/receipts/' + line.receipt_id,
                small: true
            }).e});
        });
        hide_spinner('receipt_lines');
    } catch (error) {
        console.log(error);
    };
};