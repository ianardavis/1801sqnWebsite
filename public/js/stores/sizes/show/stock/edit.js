var event_listeners = [];
function getStockEdit(stock_id) {
    getLocations();
    get(
        function(stock, options) {
            set_attribute({id: 'stock_edit_cancel',    attribute: 'href',  value: `javascript:getStockEdit('${stock.stock_id}')`});
            set_attribute({id: '_stock_edit',          attribute: 'value', value: stock._stock});
            set_attribute({id: 'stock_edit_locations', attribute: 'value', value: stock.location._location});
            addFormListener(
                'form_stock_edit',
                'PUT',
                `/stores/stocks/${stock.stock_id}`,
                {
                    onComplete: [
                        getStocks,
                        function () {$('#mdl_stock_view').modal('hide')}
                    ]
                },
                true
            );
        },
        {
            table: 'stock',
            query: [`stock_id=${stock_id}`]
        }
    );
};
function edit_stock_reset() {
    hide('div_stock_edit');
    show('btn_stock_edit');
    show('div_stock_view');
    let return_to_stack = [];
    while (event_listeners.length !== 0) {
        let listener = event_listeners.pop(),
            element  = document.querySelector(`#${listener.id}`);
        if (element) {
            if (element.id === 'form_stock_edit') element.removeEventListener('submit', listener.function)
            else                                return_to_stack.push(listener);
        };
    };
    event_listeners = return_to_stack;
};
function edit_stock() {
    show('div_stock_edit');
    hide('btn_stock_edit');
    hide('div_stock_view');
};
$('#mdl_stock_view').on('show.bs.modal', function(event) {
    edit_stock_reset();
    getStockEdit(event.relatedTarget.dataset.stock_id);
});