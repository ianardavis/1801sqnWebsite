window.addEventListener( "load", function () {
    enable_button('stock_add');
    modalOnShow('stock_add', getLocations);
    addFormListener(
        'stock_add',
        'POST',
        '/stocks',
        {onComplete: getStocks}
    );
    addListener('reload_locations_stock', getLocations);
});