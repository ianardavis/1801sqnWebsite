function viewStockEdit() {
    get({
        table: 'stock',
        where: {stock_id: path[2]}
    })
    .then(function ([stock, options]) {
        set_value('stock_location_edit', stock.location.location);
    });
};
window.addEventListener('load', function () {
    enable_button('stock_edit');
    addFormListener(
        'stock_edit',
        'PUT',
        `/stocks/${path[2]}`,
        {
            onComplete: [
                getStock,
                function () {modalHide('stock_edit')}
            ]
        }
    );
    modalOnShow('stock_edit', viewStockEdit);
    modalOnShow('stock_edit', getLocations);
    add_listener('reload_locations_edit', getLocations);
});