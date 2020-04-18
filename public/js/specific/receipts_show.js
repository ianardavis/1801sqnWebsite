function getLines(receipt_id, complete, delete_permission) {
    let spn_receipts = document.querySelector('#spn_receipts');
    spn_receipts.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#receiptTable'),
            line_count = document.querySelector('#line_count');
        if (response.lines) line_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row = table_body.insertRow(-1);
                let cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1);
                if (line.stock) {
                    cell1.innerText = line.stock.location._location
                    cell1.appendChild(link('javascript:show("stock",' + line.stock_id + ',{"height":300})'))

                    cell2.innerText = line.stock.size.item._description;
                    cell2.appendChild(link('/stores/items/' + line.stock.size.item_id));
                    
                    cell3.innerText = line.stock.size._size;
                    cell3.appendChild(link('/stores/sizes/' + line.stock.size.size_id));
                };
                cell4.innerText = line._qty;

                if (delete_permission && !complete) {
                    let cell5 = row.insertCell(-1);
                    cell5.appendChild(deleteBtn('/stores/receipt_lines/' + line.line_id));
                };
            });
        } else alert('Error: ' + response.error)
        spn_receipts.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting lines'));
    let query = ['receipt_id=' + receipt_id];
    XHR.open('GET', '/stores/getreceiptlines?' + query.join('&'));
    XHR.send();
};