let receipt_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Open', '3': 'Closed'};
showReceipts = (receipts, options = {}) => {
    let table_body = document.querySelector('#tbl_receipts');
    table_body.innerHTML = '';
    receipts.forEach(receipt => {
        let row = table_body.insertRow(-1);
        add_cell(row, {text: receipt.supplier._name});
        add_cell(row, {text: print_date(receipt.createdAt)});
        add_cell(row, {text: receipt.lines.length || '0'});
        add_cell(row, {text: receipt_statuses[String(receipt._status)]});
        add_cell(row, {append: new Link({href: `/stores/receipts/${receipt.receipt_id}`, small: true}).e});
    });
};