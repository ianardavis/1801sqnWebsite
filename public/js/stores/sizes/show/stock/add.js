window.addEventListener( "load", function () {
    addFormListener(
        'form_stock_add',
        'POST',
        '/stores/stock',
        {onComplete: getStocks}
    );
});
$('#mdl_stock_add').on('show.bs.modal', function() {getLocations()});