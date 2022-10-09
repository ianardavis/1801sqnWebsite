function listStocks(issue_id, size, blank = false) {
    clear(`sel_stock_${issue_id}`)
    .then(sel_stocks => {
        get({
            table: 'stocks',
            where: {size_id: size.size_id}
        })
        .then(function ([result, options]) {
            if (blank) sel_stocks.appendChild(new Option({text: 'Select Location'}).e)
            result.stocks.forEach(stock => {
                sel_stocks.appendChild(new Option({
                    text: `${stock.location._location} | Qty: ${stock._qty}`,
                    value: stock.stock_id
                }).e);
            });
        });
    })
};