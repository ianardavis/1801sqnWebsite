window.addEventListener( "load", function () {
    remove_attribute({id: 'btn_stock_add', attribute: 'disabled'});
    $('#mdl_stock_add').on('show.bs.modal', getLocations);
    addFormListener(
        'form_stock_add',
        'POST',
        '/stores/stock',
        {onComplete: getStocks}
    );
});