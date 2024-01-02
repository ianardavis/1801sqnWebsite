function getHoldings() {
    setValue('movement_add_amount');
    setValue('movement_add_description');
    clear('sel_holdings')
    .then(sel_holdings => {
        get({
            table: 'holdings_except',
            where: {holding_id: path[2]}
        })
        .then(function ([results, options]) {
            console.log(results);
            sel_holdings.appendChild(new Option({text: 'Select destination holding...'}).e)
            results.holdings.forEach(holding => {
                sel_holdings.appendChild(new Option({text: holding.description, value: holding.holding_id}).e)
            });
        })
    });
};
window.addEventListener('load', function () {
    enableButton('movement_add');
    modalOnShow('movement_add', getHoldings);
    addFormListener(
        'movement_add',
        'POST',
        '/movements',
        {onComplete: [
            getMovements,
            getHolding
        ]}
    );
});