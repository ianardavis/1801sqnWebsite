showOrders = (lines, options) => {
    let table_body    = document.querySelector('#orderTable'),
        order_count = document.querySelector('#order_count');
    if (lines) order_count.innerText = lines.length || '0';
    table_body.innerHTML = '';
    lines.forEach(line => {
        let row   = table_body.insertRow(-1),
            cell1 = row.insertCell(-1),
            cell2 = row.insertCell(-1),
            cell3 = row.insertCell(-1),
            cell4 = row.insertCell(-1),
            cell5 = row.insertCell(-1),
            cell6 = row.insertCell(-1),
            cell7 = row.insertCell(-1),
            cell8 = row.insertCell(-1),
            cell9 = row.insertCell(-1);
        cell1.dataset.sort = new Date(line.order._date).getTime();
        cell1.innerText = new Date(line.order._date).toDateString();
        cell2.innerText = line.size.item._description;
        cell3.innerText = line.size._size;
        cell4.innerText = line._qty;
        cell5.innerText = line._status;
        //////////////////
        if (line.demand_line_id) cell6.appendChild(link('/stores/demands/' + line.demand_line_id, false))
        //////////////////
        cell9.appendChild(link('/stores/orders/' + line.order_id, false));
        });
    hide_spinner('orders');
};