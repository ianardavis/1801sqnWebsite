function getOrders() {
    let spn_orders = document.querySelector('#spn_orders');
    spn_orders.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#orderTable');
        table_body.innerHTML = '';
        if (response.result) {
            response.orders.forEach(order => {
                let row = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1),
                    cell6 = row.insertCell(-1);
                if (Number(order.ordered_for) === -1) cell1.innerText = 'Backing Stock'
                else cell1.innerText = order._for.rank._rank + ' ' + order._for._name + ', ' + order._for._ini;
                cell2.dataset.sort = new Date(order._date).getTime();
                cell2.innerText    = new Date(order._date).toDateString();
                cell3.innerText    = order.lines.length;
                if (order._complete) cell4.innerHTML = _check();
                if (order._closed)   cell5.innerHTML = _check();
                cell6.appendChild(link('/stores/orders/' + order.order_id, false));
            });
        } else alert('Error: ' + response.error)
        spn_orders.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting orders'));
    let sel_closed   = document.querySelector('#sel_closed'),
        sel_complete = document.querySelector('#sel_complete'),
        query        = [];
    if      (Number(sel_complete.value) === 2) query.push('_complete=0')
    else if (Number(sel_complete.value) === 3) query.push('_complete=1');
    if      (Number(sel_closed.value) === 2)   query.push('_closed=0')
    else if (Number(sel_closed.value) === 3)   query.push('_closed=1');
    XHR.open('GET', '/stores/get/orders?' + query.join('&'));
    XHR.send();
};