function getHolding() {
    get({
        table: 'holding',
        query: [`"holding_id":"${path[2]}"`]
    })
    .then(function ([holding, options]) {
        set_breadcrumb({text: holding.description});
        set_innerText({id: 'holding_cash',        value: Number(holding.cash).toFixed(2)});
        set_innerText({id: 'holding_createdAt',   value: print_date(holding.createdAt)});
        set_innerText({id: 'holding_updatedAt',   value: print_date(holding.updatedAt)});
        set_attribute({id: 'movement_add_amount', attribute: 'max', value: holding.cash});
        document.querySelectorAll('.holding_id').forEach(e => e.setAttribute('value', holding.holding_id));
    });
};
addReloadListener(getHolding);