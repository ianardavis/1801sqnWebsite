function getItemEdit() {
    get({
        table: 'canteen_item',
        query: [`item_id=${path[2]}`]
    })
    .then(function([item, options]) {
        set_value({id: 'item_name_edit',    value: item.name});
        set_value({id: 'item_price_edit',   value: item.price});
        set_value({id: 'item_cost_edit',    value: item.cost});
        set_value({id: 'item_current_edit', value: item.current});
    });
};
window.addEventListener('load', function () {
    modalOnShow('item_edit', getItemEdit);
    enable_button('item_edit');
    addFormListener(
        'item_edit',
        'PUT',
        `/canteen_items/${path[2]}`,
        {
            onComplete: [
                getItem,
                function () {modalHide('item_edit')}
            ]
        }
    )
});