window.addEventListener( "load", function () {
    enable_button('stock_add');
    $('#mdl_stock_add').on('show.bs.modal', getLocations);
    addFormListener(
        'stock_add',
        'POST',
        '/stocks',
        {onComplete: getStocks}
    );
    addListener('reload_locations_stock', getLocations);
});