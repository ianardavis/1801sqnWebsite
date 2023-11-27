function getItemEdit() {
    get({
        table: 'canteen_item',
        where: {item_id: path[2]}
    })
    .then(function([item, options]) {
        setValue('item_name_edit',    item.name);
        setValue('item_price_edit',   item.price);
        setValue('item_cost_edit',    item.cost);
        setValue('item_current_edit', (item.current ? '1' : '0'));
    });
};
window.addEventListener('load', function () {
    modalOnShow('item_edit', getItemEdit);
    enableButton('item_edit');
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