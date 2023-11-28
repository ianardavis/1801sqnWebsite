function getHolding() {
    get({
        table: 'holding',
        where: {holding_id: path[2]}
    })
    .then(function ([holding, options]) {
        setBreadcrumb(holding.description);
        setInnerText('holding_cash',      Number(holding.cash).toFixed(2));
        setInnerText('holding_createdAt', printDate(holding.createdAt));
        setInnerText('holding_updatedAt', printDate(holding.updatedAt));
        setAttribute('movement_add_amount', 'max', holding.cash);
        document.querySelectorAll('.holding_id').forEach(e => e.setAttribute('value', holding.holding_id));
    });
};
window.addEventListener('load', function () {
    addListener('reload', getHolding);
});