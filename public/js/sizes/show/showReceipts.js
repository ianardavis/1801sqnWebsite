showReceipts = (lines, options) => {
    try {
        let table_body    = document.querySelector('#receiptTable'),
            receipt_count = document.querySelector('#receipt_count');
        receipt_count.innerText = lines.length || '0';
        table_body.innerHTML = '';
        lines.forEach(line => {
            let row = table_body.insertRow(-1),
                cell3 = row.insertCell(-1),
                cell4 = row.insertCell(-1);
            add_cell(row, {
                sort: new Date(line.receipt._date).getTime(),
                text: new Date(line.receipt._date).toDateString()
            });
            add_cell(row, {text: line.stock.location._location});
            add_cell(row, {text: line._qty});
            add_cell(row, {append: new link({
                href: '/stores/receipts/' + line.receipt_id,
                small: true
            }).link});
        });
        hide_spinner('receipt_lines');
    } catch (error) {
        console.log(error);
    };
};