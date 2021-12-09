function getStock() {
    get({
        table: 'stock',
        query: [`"stock_id":"${path[2]}"`]
    })
    .then(function ([stock, options]) {
        set_breadcrumb(stock.size.item.description,                                      'breadcrumb_item', `/items/${stock.size.item_id}`);
        set_breadcrumb(`${print_size_text(stock.size.item)}: ${print_size(stock.size)}`, 'breadcrumb_size', `/sizes/${stock.size_id}`);
        set_breadcrumb(`Location: ${stock.location.location}`)
        set_innerText('stock_item',     stock.size.item.description);
        set_innerText('stock_size',     print_size(stock.size));
        set_innerText('stock_location', stock.location.location);
        set_innerText('stock_qty',      stock.qty || '0');
        set_href('stock_location_link', `/locations/${stock.location_id}`);
        set_href('stock_item_link',     `/items/${stock.size.item_id}`);
        set_href('stock_size_link',     `/sizes/${stock.size_id}`);
        document.querySelectorAll('.stock_id').forEach(e => e.setAttribute('value', stock.stock_id))
    });
};