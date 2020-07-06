function getNSNs(size_id, _default, delete_permission) {
    let spn_nsns = document.querySelector('#spn_nsns');
    spn_nsns.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#nsnTable'),
            nsn_count = document.querySelector('#nsn_count');
        if (response.nsns) nsn_count.innerText = response.nsns.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.nsns.forEach(nsn => {
                let row = table_body.insertRow(-1);
                let cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1);
                cell1.innerText = nsn._nsn;
                if (nsn.nsn_id === _default) cell2.innerHTML = _check();
                cell3.appendChild(link('javascript:show("nsns",' + nsn.nsn_id + ',{"height":200})', false));
                if (delete_permission) {
                    let cell4 = row.insertCell(-1);
                    cell4.appendChild(deleteBtn('/stores/nsns/' + nsn.nsn_id, 'NSN'));
                };
            });
        } else alert('Error: ' + response.error)
        spn_nsns.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting NSNs'));
    let query = ['size_id=' + size_id];
    XHR.open('GET', '/stores/get/nsns?' + query.join('&'));
    XHR.send();
};
function getSerials(size_id, delete_permission) {
    let spn_serials = document.querySelector('#spn_serials');
    spn_serials.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#serialTable'),
            serial_count = document.querySelector('#serial_count');
        if (response.serials) serial_count.innerText = response.serials.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.serials.forEach(serial => {
                let row = table_body.insertRow(-1);
                let cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1);
                cell1.innerText = serial._serial;
                cell2.appendChild(link('javascript:show("serials",' + serial.serial_id + ',{"height":200})', false));
                if (delete_permission) {
                    let cell3 = row.insertCell(-1);
                    cell3.appendChild(deleteBtn('/stores/serials/' + serial.serial_id, 'NSN'));
                };
            });
        } else alert('Error: ' + response.error)
        spn_serials.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting serials'));
    let query = ['size_id=' + size_id];
    XHR.open('GET', '/stores/get/serials?' + query.join('&'));
    XHR.send();
};
function getStock(size_id, delete_permission) {
    let spn_stock = document.querySelector('#spn_stock');
    spn_stock.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#stockTable'),
            stock_count = document.querySelector('#stock_count');
        if (response.stock) stock_count.innerText = response.stock.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.stock.forEach(stk => {
                let row = table_body.insertRow(-1);
                let cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1);
                cell1.innerText = stk.location._location;
                cell2.innerHTML = stk._qty;
                cell3.appendChild(link('javascript:show("stock",' + stk.stock_id + ')', false));
                if (delete_permission) {
                    let cell4 = row.insertCell(-1);
                    cell4.appendChild(deleteBtn('/stores/stock/' + stk.stock_id, 'stock'));
                };
            });
        } else alert('Error: ' + response.error)
        spn_stock.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting stock'));
    let query = ['size_id=' + size_id];
    XHR.open('GET', '/stores/get/stock?' + query.join('&'));
    XHR.send();
};
function getRequestLines(size_id) {
    let spn_requests = document.querySelector('#spn_requests');
    spn_requests.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response      = JSON.parse(event.target.responseText),
            table_body    = document.querySelector('#requestTable'),
            request_count = document.querySelector('#request_count');
        if (response.lines) request_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row   = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1);
                cell1.innerText = line.request._for.rank._rank + ' ' + line.request._for.full_name;
                cell2.innerHTML = line._qty;
                cell3.appendChild(link('/stores/requests/' + line.request_id, false));
            });
        } else alert('Error: ' + response.error)
        spn_requests.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting requests'));
    let query = ['size_id=' + size_id];
    XHR.open('GET', '/stores/request_lines?' + query.join('&'));
    XHR.send();
};
function getOrderLines(size_id) {
    let spn_orders = document.querySelector('#spn_orders');
    spn_orders.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response      = JSON.parse(event.target.responseText),
            table_body    = document.querySelector('#orderTable'),
            order_count = document.querySelector('#order_count');
        if (response.lines) order_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row   = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1);
                if (Number(line.order.ordered_for) === -1) cell1.innerText = 'Backing Stock'
                else cell1.innerText = line.order._for.rank._rank + ' ' + line.order._for.full_name;
                cell2.innerHTML = line._qty;
                cell3.appendChild(link('/stores/orders/' + line.order_id, false));
            });
        } else alert('Error: ' + response.error)
        spn_orders.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting orders'));
    let query = ['size_id=' + size_id];
    XHR.open('GET', '/stores/get/orderlines?' + query.join('&'));
    XHR.send();
};
function getReceiptLines(size_id) {
    let spn_receipts = document.querySelector('#spn_receipts');
    spn_receipts.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response      = JSON.parse(event.target.responseText),
            table_body    = document.querySelector('#receiptTable'),
            receipt_count = document.querySelector('#receipt_count');
        if (response.lines) receipt_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row   = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1);
                cell1.dataset.sort = new Date(line.receipt._date).getTime();
                cell1.innerText = new Date(line.receipt._date).toDateString();
                cell2.innerHTML = line.stock.location._location;
                cell3.innerHTML = line._qty;
                cell4.appendChild(link('/stores/receipts/' + line.receipt_id, false));
            });
        } else alert('Error: ' + response.error)
        spn_receipts.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting receipts'));
    XHR.open('GET', '/stores/get/receipt_lines?size_id=' + size_id);
    XHR.send();
};
function getIssueLines(size_id) {
    let spn_issues = document.querySelector('#spn_issues');
    spn_issues.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response    = JSON.parse(event.target.responseText),
            table_body  = document.querySelector('#issueTable'),
            issue_count = document.querySelector('#issue_count');
        if (response.lines) issue_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row   = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),ll
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1);ull
                cell1.innerText = new Date(line.issue._date).toDateString();
                cell2.innerHTML = line.issue._to.rank._rank + ' ' + line.issue._to.full_name;
                cell3.innerHTML = line._qty;
                cell4.appendChild(link('/stores/issues/' + line.issue_id, false));
            });
        } else alert('Error: ' + response.error)
        spn_issues.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting issues'));
    XHR.open('GET', '/stores/get/issue_lines?size_id=' + size_id);
    XHR.send();
};