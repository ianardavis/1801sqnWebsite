function getItemEdit() {
    get({
        table: 'canteen_item',
        query: [`"item_id":"${path[2]}"`]
    })
    .then(function([item, options]) {
        set_value('item_name_edit',    item.name);
        set_value('item_price_edit',   item.price);
        set_value('item_cost_edit',    item.cost);
        set_value('item_current_edit', (item.current ? '1' : '0'));
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