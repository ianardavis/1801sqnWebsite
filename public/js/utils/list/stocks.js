function listStocks(issue_id, size, blank = false) {
    get(
        {
            table: 'stocks',
            query: [`size_id=${size.size_id}`]
        },
        function (stocks, options) {
            let sel_stock = document.querySelector(`#sel_stock_${issue_id}`);
            if (sel_stock) {
                sel_stock.innerHTML = '';
                if (blank) sel_stock.appendChild(new Option({text: 'Select Location'}).e)
                stocks.forEach(stock => {
                    sel_stock.appendChild(new Option({
                        text: `${stock.location._location} | Qty: ${stock._qty}`,
                        value: stock.stock_id
                    }).e);
                });
            };
        }
    )
};