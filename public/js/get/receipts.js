getReceipts = (query = [], supplier = false) => {
    show_spinner('receipts');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#receiptTable'),
            count      = document.querySelector('#receipt_count');
        table_body.innerHTML = '';
        if (response.result) {
            if (count) count.innerText = response.receipts.length || 0;
            response.receipts.forEach(receipt => {
                let row = table_body.insertRow(-1);
                if (supplier) {
                    add_cell(row, {
                        text: receipt.supplier._name,
                        append: new Link({
                            href: '/stores/suppliers/' + receipt.supplier_id,
                            small: true,
                            float: true,
                            type: 'show'
                        }).link
                    });
                };
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
                }).link});
            });
        } else alert('Error: ' + response.error);
        hide_spinner('receipts');
    });
    let completeSelect = document.querySelector('#receiptsCompleteSelect'),
        supplierSelect = document.querySelector('#supplierSelect');
    if      (supplierSelect && Number(supplierSelect.value) !== -1) query.push('supplier_id=' + supplierSelect.value);
    if      (Number(completeSelect.value) === 2)  query.push('_complete=0')
    else if (Number(completeSelect.value) === 3)  query.push('_complete=1');
    XHR_send(XHR, 'receipts', '/stores/get/receipts?' + query.join('&'));
};