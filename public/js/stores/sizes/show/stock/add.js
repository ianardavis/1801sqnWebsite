window.addEventListener( "load", () => {
    addFormListener(
        'form_add_stock',
        'POST',
        '/stores/stock',
        {onComplete: getStocks}
    );
});
$('#mdl_stock_add').on('show.bs.modal', function() {getLocations()});