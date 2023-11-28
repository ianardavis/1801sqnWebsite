function getHoldings() {
    clear('tbl_holdings')
    .then(tbl_holdings => {
        get({
            table: 'holdings',
            func: getHoldings
        })
        .then(function ([results, options]) {
            results.holdings.forEach(holding => {
                let row = tbl_holdings.insertRow(-1);
                addCell(row, {text: holding.description});
                addCell(row, {text: `£${Number(holding.cash).toFixed(2)}`});
                addCell(row, {append: new Link(`/holdings/${holding.holding_id}`).e});
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getHoldings);
    addSortListeners('holdings', getHoldings);
    getHoldings();
});