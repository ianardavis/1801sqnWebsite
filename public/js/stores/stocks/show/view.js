function getStock() {
    get({
        table: 'stock',
        where: {stock_id: path[2]}
    })
    .then(function ([stock, options]) {
        setBreadcrumb(stock.size.item.description,                                      'breadcrumb_item', `/items/${stock.size.item_id}`);
        setBreadcrumb(`${print_size_text(stock.size.item)}: ${print_size(stock.size)}`, 'breadcrumb_size', `/sizes/${stock.size_id}`);
        setBreadcrumb(`Location: ${stock.location.location}`)
        setInnerText('stock_item',     stock.size.item.description);
        setInnerText('stock_size',     print_size(stock.size));
        setInnerText('stock_location', stock.location.location);
        setInnerText('stock_qty',      stock.qty || '0');
        setHREF('stock_location_link', `/locations/${stock.location_id}`);
        setHREF('stock_item_link',     `/items/${stock.size.item_id}`);
        setHREF('stock_size_link',     `/sizes/${stock.size_id}`);
        document.querySelectorAll('.stock_id').forEach(e => e.setAttribute('value', stock.stock_id))
    });
};
window.addEventListener('load', function () {
    getStock();
    document.querySelectorAll('.stock_id').forEach(e => e.value = path[2]);
});