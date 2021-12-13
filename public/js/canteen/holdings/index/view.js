function getHoldings() {
    clear('tbl_holdings')
    .then(tbl_holdings => {
        get({
            table: 'holdings',
            ...sort_query(tbl_holdings)
        })
        .then(function ([holdings, options]) {
            holdings.forEach(holding => {
                let row = tbl_holdings.insertRow(-1);
                add_cell(row, {text: holding.description});
                add_cell(row, {text: `£${Number(holding.cash).toFixed(2)}`});
                add_cell(row, {append: new Link({href: `/holdings/${holding.holding_id}`}).e});
            });
        });
    });
};
addReloadListener(getHoldings);