getDemands = () => {
    show_spinner('demands');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#demandTable');
        table_body.innerHTML = '';
        if (response.result) {
            response.demands.forEach(demand => {
                let row = table_body.insertRow(-1);
                add_cell(row, {text: demand.supplier._name});
                add_cell(row, {
                    text: new Date(demand._date).toDateString(),
                    sort: new Date(demand._date).getTime()
                });
                add_cell(row, {text: demand.user.rank._rank + ' ' + demand.user.full_name});
                add_cell(row, {text: demand.lines.length});
                if (demand._complete) add_cell(row, {html: _check()})
                else add_cell(row);
                if (demand._closed)   add_cell(row, {html: _check()})
                else add_cell(row);
                add_cell(row, {append: link('/stores/demands/' + demand.demand_id, false)});
            });
        } else alert('Error: ' + response.error);
        hide_spinner('demands');
    });
    let closedSelect    = document.querySelector('#closedSelect'),
        completeSelect  = document.querySelector('#completeSelect'),
        suppliersSelect = document.querySelector('#suppliersSelect'),
        query        = [];
    if      (Number(suppliersSelect.value) !== -1) query.push('supplier_id=' + suppliersSelect.value);
    if      (Number(completeSelect.value) === 2)   query.push('_complete=0')
    else if (Number(completeSelect.value) === 3)   query.push('_complete=1');
    if      (Number(closedSelect.value) === 2)     query.push('_closed=0')
    else if (Number(closedSelect.value) === 3)     query.push('_closed=1');
    XHR_send(XHR, 'demands', '/stores/get/demands?' + query.join('&'));
};