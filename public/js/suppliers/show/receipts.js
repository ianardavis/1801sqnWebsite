showReceipts = (receipts, na) => {
    let table_body = document.querySelector('#receiptTable'),
        count      = document.querySelector('#receipt_count');
    table_body.innerHTML = '';
    if (count) count.innerText = receipts.length || 0;
    receipts.forEach(receipt => {
        let row = table_body.insertRow(-1);
        add_cell(row, {
            sort: new Date(receipt._date).getTime(),
            text: new Date(receipt._date).toDateString()
        });
        add_cell(row, {text: receipt.lines.length});
        if (receipt._complete) add_cell(row, {html: _check()})
        else add_cell(row);
        add_cell(row, {text: receipt.user.rank._rank + ' ' + receipt.user.full_name});
        add_cell(row, {append: new Link({
            href: '/stores/receipts/' + receipt.receipt_id,
            small: true,
            type: 'show'
        }).e});
    });
};
receipt_query = () => {
    let completeSelect = document.querySelector('#receiptsCompleteSelect'),
        query = [`supplier_id=${path[3]}`];
    if      (Number(completeSelect.value) === 2)  query.push('_complete=0')
    else if (Number(completeSelect.value) === 3)  query.push('_complete=1');
    return query;
};