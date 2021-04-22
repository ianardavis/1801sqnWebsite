function getStock() {
    get({
        table: 'stock',
        query: [`stock_id=${path[2]}`]
    })
    .then(function ([stock, options]) {
        set_innerText({id: 'stock_location', text: stock.location.location});
        set_innerText({id: 'stock_qty',      text: stock.qty});
        document.querySelectorAll('.stock_id').forEach(e => e.setAttribute('value', stock.stock_id))
    });
};