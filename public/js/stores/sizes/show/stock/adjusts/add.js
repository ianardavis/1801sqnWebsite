window.addEventListener( "load", function () {
    $('#mdl_stock_view').on('show.bs.modal', function (event) {
        set_attribute({id: 'stock_id_adjust', attribute: 'value', value: event.relatedTarget.dataset.stock_id});
        set_value(    {id: 'stock_id_qty', value: '0'});
    });
    addFormListener(
        'form_adjust_add',
        'POST',
        '/stores/adjusts',
        {onComplete: [
            getStocks,
            function() {$('#mdl_stock_view').modal('hide')}
        ]}
    );
});