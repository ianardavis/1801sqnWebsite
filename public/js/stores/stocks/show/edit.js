function viewStockEdit() {
    get({
        table: 'stock',
        query: [`stock_id=${path[2]}`]
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
                function () {$('#mdl_stock_edit').modal('hide')}
            ]
        }
    );
    $('#mdl_stock_edit').on('show.bs.modal', viewStockEdit);
    $('#mdl_stock_edit').on('show.bs.modal', getLocations);
    addClickListener('reload_locations', getLocations);
})