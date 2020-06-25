getDemands = () => {
    show_spinner('demands');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#demandTable');
        table_body.innerHTML = '';
        if (response.result) {
            response.demands.forEach(demand => {
                let row = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1),
                    cell6 = row.insertCell(-1),
                    cell7 = row.insertCell(-1);
                cell1.innerText    = demand.supplier._name;
                cell2.dataset.sort = new Date(demand._date).getTime();
                cell2.innerText    = new Date(demand._date).toDateString();
                cell3.innerText    = demand.user.rank._rank + ' ' + demand.user._name + ', ' + demand.user._ini
                cell4.innerText    = demand.lines.length;
                if (demand._complete) cell5.innerHTML = _check();
                if (demand._closed)   cell6.innerHTML = _check();
                cell7.appendChild(link('/stores/demands/' + demand.demand_id, false));
            });
        } else alert('Error: ' + response.error);
        hide_spinner('demands');
    });
    let sel_closed   = document.querySelector('#sel_closed'),
        sel_complete = document.querySelector('#sel_complete'),
        sel_supplier = document.querySelector('#sel_supplier'),
        query        = [];
    if      (Number(sel_supplier.value) !== -1) query.push('supplier_id=' + sel_supplier.value);
    if      (Number(sel_complete.value) === 2)  query.push('_complete=0')
    else if (Number(sel_complete.value) === 3)  query.push('_complete=1');
    if      (Number(sel_closed.value) === 2)    query.push('_closed=0')
    else if (Number(sel_closed.value) === 3)    query.push('_closed=1');
    XHR_send(XHR, 'demands', '/stores/get/demands?' + query.join('&'));
};