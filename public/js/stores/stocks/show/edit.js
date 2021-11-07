function viewStockEdit() {
    get({
        table: 'stock',
        query: [`"stock_id":"${path[2]}"`]
    })
    .then(function ([stock, options]) {
        set_value({id: 'stock_location_edit', value: stock.location.location});
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
    addListener('reload_locations_edit', getLocations);
});