function getHolding() {
    get({
        table: 'holding',
        where: {holding_id: path[2]}
    })
    .then(function ([holding, options]) {
        set_breadcrumb(holding.description);
        set_innerText('holding_cash',      Number(holding.cash).toFixed(2));
        set_innerText('holding_createdAt', print_date(holding.createdAt));
        set_innerText('holding_updatedAt', print_date(holding.updatedAt));
        set_attribute('movement_add_amount', 'max', holding.cash);
        document.querySelectorAll('.holding_id').forEach(e => e.setAttribute('value', holding.holding_id));
    });
};
addReloadListener(getHolding);