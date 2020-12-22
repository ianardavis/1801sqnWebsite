window.addEventListener( "load", function () {
    addFormListener(
        'form_adjust_add',
        'POST',
        '/stores/adjusts',
        {onComplete: [
            getStocks,
            function() {$('#mdl_adjust_add').modal('hide')}
        ]}
    );
});
$('#mdl_adjust_add').on('show.bs.modal', function(event) {
    get(
        function (stock, options) {
            set_innerText({id: 'adjust_item',     text: stock.size.item._description});
            set_innerText({id: 'adjust_size',     text: stock.size._size});
            set_innerText({id: 'adjust_location', text: stock.location._location});
            set_innerText({id: 'adjust_qty',      text: stock._qty});
            document.querySelector('#adjust_new_qty').value = '';
            document.querySelector('#adjust_type').value = '';
            $('#mdl_stock_view').modal('hide');
        },
        {
            table: 'stock',
            query: [`stock_id=${event.relatedTarget.dataset.stock_id}`],
            onFail: function() {$('#mdl_adjust_add').modal('hide')}
        }
    );
});