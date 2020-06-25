function getReceipts() {
    let spn_receipts = document.querySelector('#spn_receipts');
    spn_receipts.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#receiptTable');
        table_body.innerHTML = '';
        if (response.result) {
            response.receipts.forEach(receipt => {
                let row = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1),
                    cell6 = row.insertCell(-1);
                cell1.innerText    = receipt.supplier._name;
                cell1.appendChild(link('/stores/suppliers/' + receipt.supplier_id));

                cell2.dataset.sort = new Date(receipt._date).getTime();
                cell2.innerText    = new Date(receipt._date).toDateString();

                cell3.innerText    = receipt.lines.length;
                
                if (receipt._complete) cell4.innerHTML = _check();

                cell5.innerText    = receipt.user.rank._rank + ' ' + receipt.user._name + ', ' + receipt.user._ini;
                
                cell6.appendChild(link('/stores/receipts/' + receipt.receipt_id, false));
            });
        } else alert('Error: ' + response.error)
        spn_receipts.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting receipts'));
    let sel_complete = document.querySelector('#sel_complete'),
        sel_supplier = document.querySelector('#sel_supplier'),
        query        = [];
    if      (Number(sel_supplier.value) !== -1) query.push('supplier_id=' + sel_supplier.value);
    if      (Number(sel_complete.value) === 2)  query.push('_complete=0')
    else if (Number(sel_complete.value) === 3)  query.push('_complete=1');
    XHR.open('GET', '/stores/get/receipts?' + query.join('&'));
    XHR.send();
};