showDemands = (demands, na) => {
    let table_body = document.querySelector('#demandTable'),
        count      = document.querySelector('#demand_count');
    table_body.innerHTML = '';
    if (count) count.innerText = demands.length;
    demands.forEach(demand => {
        let row = table_body.insertRow(-1);
        add_cell(row, {
            text: new Date(demand._date).toDateString(),
            sort: new Date(demand._date).getTime()
        });
        add_cell(row, {text: demand.lines.length});
        if (demand._complete) add_cell(row, {html: _check()})
        else add_cell(row);
        if (demand._closed)   add_cell(row, {html: _check()})
        else add_cell(row);
        add_cell(row, {text: demand.user.rank._rank + ' ' + demand.user.full_name});
        add_cell(row, {append: new Link({
            href: `/stores/demands/${demand.demand_id}`,
            small: true,
            type: 'show'
        }).link});
    });
};
demand_query = () => {
    let closedSelect    = document.querySelector('#demandsClosedSelect'),
        completeSelect  = document.querySelector('#demandsCompleteSelect'),
        suppliersSelect = document.querySelector('#suppliersSelect'),
        query = [`supplier_id=${path[3]}`];
    if      (suppliersSelect && Number(suppliersSelect.value) !== -1) query.push(`supplier_id=${suppliersSelect.value}`);
    if      (Number(completeSelect.value) === 2) query.push('_complete=0')
    else if (Number(completeSelect.value) === 3) query.push('_complete=1');
    if      (Number(closedSelect.value) === 2)   query.push('_closed=0')
    else if (Number(closedSelect.value) === 3)   query.push('_closed=1');
    return query;
};