getOrders = () => {
    show_spinner('orders');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#orderTable');
        table_body.innerHTML = '';
        if (response.result) {
            response.orders.forEach(order => {
                let row = table_body.insertRow(-1);
                if (Number(order.ordered_for) === -1) add_cell(row, {text: 'Backing Stock'}) 
                else add_cell(row, {text: order._for.rank._rank + ' ' + order._for.full_name});
                add_cell(row, {
                    sort: new Date(order._date).getTime(),
                    text: new Date(order._date).toDateString()
                });
                add_cell(row, {text: order.lines.length});
                if (order._complete) add_cell(row, {html: _check()})
                else add_cell(row);
                if (order._closed)   add_cell(row, {html: _check()})
                else add_cell(row);
                add_cell(row, {append: link('/stores/orders/' + order.order_id, false)});
            });
        } else alert('Error: ' + response.error);
        hide_spinner('orders');
    });
    let closedSelect   = document.querySelector('#closedSelect'),
    completeSelect = document.querySelector('#completeSelect'),
        query        = [];
    if      (Number(completeSelect.value) === 2) query.push('_complete=0')
    else if (Number(completeSelect.value) === 3) query.push('_complete=1');
    if      (Number(closedSelect.value) === 2)   query.push('_closed=0')
    else if (Number(closedSelect.value) === 3)   query.push('_closed=1');
    XHR_send(XHR, 'orders', '/stores/get/orders?' + query.join('&'));
};