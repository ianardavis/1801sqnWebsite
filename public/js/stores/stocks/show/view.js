function getStock() {
    get({
        table: 'stock',
        query: [`stock_id=${path[2]}`]
    })
    .then(function ([stock, options]) {
        set_breadcrumb({text: `${stock.size.item.description} | ${print_size_text(stock.size.item)}: ${print_size(stock.size)} | Location: ${stock.location.location}`})
        set_innerText({id: 'stock_item',     text: stock.size.item.description});
        set_innerText({id: 'stock_size',     text: print_size(stock.size)});
        set_innerText({id: 'stock_location', text: stock.location.location});
        set_innerText({id: 'stock_qty',      text: stock.qty || '0'});
        set_href({id: 'stock_location_link', value: `/locations/${stock.location_id}`});
        set_href({id: 'stock_item_link', value: `/items/${stock.size.item_id}`});
        set_href({id: 'stock_size_link', value: `/sizes/${stock.size_id}`});
        document.querySelectorAll('.stock_id').forEach(e => e.setAttribute('value', stock.stock_id))
    });
};