function getItems(supplier_id) {
    let spn_items = document.querySelector('#spn_items');
    spn_items.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response  = JSON.parse(event.target.responseText),
            sel_sizes = document.querySelector('#size_id');
        sel_sizes.innerHTML = '';
        if (response.result) {
            let item_count = document.querySelector('#item_count');
            item_count.innerText = response.sizes.length;
            response.sizes.forEach(size => {
                let _option = document.createElement('option');
                _option.value = size.size_id;
                _option.innerText = size.item._description + ', size: ' + size._size;
                sel_sizes.appendChild(_option);
            });
        } else alert('Error: ' + response.error)
        spn_items.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting items'));
    XHR.open('GET', '/stores/getsizes/supplier_id/' + supplier_id);
    XHR.send();
};
function getDemands(supplier_id) {
    let spn_demands = document.querySelector('#spn_demands');
    spn_demands.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response    = JSON.parse(event.target.responseText),
            table_body  = document.querySelector('#demandTable');
        table_body.innerHTML = '';
        if (response.result) {
            let demand_count = document.querySelector('#demand_count');
            demand_count.innerText = response.demands.length;
            response.demands.forEach(demand => {
                let row = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1),
                    cell6 = row.insertCell(-1);
                cell1.dataset.sort = new Date(demand._date).getTime();
                cell1.innerText    = new Date(demand._date).toDateString();
                cell2.innerText    = demand.lines.length;
                if (demand._complete) cell3.innerHTML = _check();
                if (demand._closed) cell4.innerHTML = _check();
                cell5.innerText    = demand.user.rank._rank + ' ' + demand.user._name + ', ' + demand.user._ini
                cell6.appendChild(link('/stores/demands/' + demand.demand_id, false));
            });
        } else alert('Error: ' + response.error)
        spn_demands.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting demands'));
    let sel_closed   = document.querySelector('#sel_closed'),
        sel_complete = document.querySelector('#sel_complete_demands'),
        query        = ['supplier_id=' + supplier_id];
    if      (Number(sel_complete.value) === 2) query.push('_complete=0')
    else if (Number(sel_complete.value) === 3) query.push('_complete=1');
    if      (Number(sel_closed.value) === 2)   query.push('_closed=0')
    else if (Number(sel_closed.value) === 3)   query.push('_closed=1');
    XHR.open('GET', '/stores/getdemands?' + query.join('&'));
    XHR.send();
};
function getReceipts(supplier_id) {
    let spn_receipts = document.querySelector('#spn_receipts');
    spn_receipts.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response    = JSON.parse(event.target.responseText),
            table_body  = document.querySelector('#receiptTable');
        table_body.innerHTML = '';
        if (response.result) {
            let receipt_count = document.querySelector('#receipt_count');
            receipt_count.innerText = response.receipts.length;
            response.receipts.forEach(receipt => {
                let row = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1);
                cell1.dataset.sort = new Date(receipt._date).getTime();
                cell1.innerText    = new Date(receipt._date).toDateString();
                cell2.innerText    = receipt.lines.length;
                if (receipt._complete) cell3.innerHTML = _check();
                cell4.innerText    = receipt.user.rank._rank + ' ' + receipt.user._name + ', ' + receipt.user._ini
                cell5.appendChild(link('/stores/receipts/' + receipt.receipt_id, false));
            });
        } else alert('Error: ' + response.error)
        spn_receipts.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting receipts'));
    let sel_complete = document.querySelector('#sel_complete_receipts'),
        query        = ['supplier_id=' + supplier_id];
    if      (Number(sel_complete.value) === 2) query.push('_complete=0')
    else if (Number(sel_complete.value) === 3) query.push('_complete=1');
    
    XHR.open('GET', '/stores/getreceipts?' + query.join('&'));
    XHR.send();
};
function goToItemSize() {
    var size = document.querySelector('#size_id');
    if (size) window.location = '/stores/sizes/' + size.value;
};