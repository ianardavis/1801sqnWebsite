function getItemEdit() {
    get(
        {
            table: 'item',
            query: [`item_id=${path[2]}`]
        },
        function(item, options) {
            set_value({id: '_name_edit',    value: item._name});
            set_value({id: '_price_edit',   value: item._price});
            set_value({id: '_cost_edit',    value: item._cost});
            set_value({id: '_current_edit', value: String(item._current)});
        }
    );
};
window.addEventListener('load', function () {
    $('#mdl_item_edit').on('show.bs.modal', getItemEdit);
    enable_button('item_edit');
    addFormListener(
        'item_edit',
        'PUT',
        `/canteen/items/${path[2]}`,
        {
            onComplete: [
                getItem,
                function () {$('#mdl_item_edit').modal('hide')}
            ]
        }
    )
});