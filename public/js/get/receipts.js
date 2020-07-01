getReceipts = () => {
    show_spinner('receipts');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#receiptTable');
        table_body.innerHTML = '';
        if (response.result) {
            response.receipts.forEach(receipt => {
                let row = table_body.insertRow(-1);
                add_cell(row, {
                    text: receipt.supplier._name,
                    append: link('/stores/suppliers/' + receipt.supplier_id)
                });
                add_cell(row, {
                    sort: new Date(receipt._date).getTime(),
                    text: new Date(receipt._date).toDateString()
                });
                add_cell(row, {text: receipt.lines.length});
                if (receipt._complete) add_cell(row, {html: _check()})
                else add_cell(row);
                add_cell(row, {text: receipt.user.rank._rank + ' ' + receipt.user.full_name});
                add_cell(row, {append: link('/stores/receipts/' + receipt.receipt_id, false)});
            });
        } else alert('Error: ' + response.error);
        hide_spinner('receipts');
    });
    let completeSelect = document.querySelector('#completeSelect'),
        supplierSelect = document.querySelector('#supplierSelect'),
        query        = [];
    if      (Number(supplierSelect.value) !== -1) query.push('supplier_id=' + supplierSelect.value);
    if      (Number(completeSelect.value) === 2)  query.push('_complete=0')
    else if (Number(completeSelect.value) === 3)  query.push('_complete=1');
    XHR_send(XHR, 'receipts', '/stores/get/receipts?' + query.join('&'));
};