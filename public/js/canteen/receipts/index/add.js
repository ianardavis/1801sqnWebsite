function calculate_cost() {
    let qty        = document.querySelector('#qty'),
        cost_total = document.querySelector('#cost_total');
    if (qty.value > 0 && cost_total.value !== '') {
        set_value({id: 'cost_each', value: Number(cost_total.value / qty.value).toFixed(2)});
    };
};
function reset_add_item() {
    set_value({id: 'qty',        value: ''});
    set_value({id: 'cost_each',  value: ''});
    set_value({id: 'cost_total', value: ''});
};
function getItems() {
    clear('sel_items')
    .then(sel_items => {
        get({table: 'canteen_items'})
        .then(function ([items, options]) {
            sel_items.appendChild(
                new Option({
                    text: 'Select item ...',
                    selected: true
                }).e
            )
            items.forEach(item => {
                sel_items.appendChild(
                    new Option({
                        value: item.item_id,
                        text:  item.name
                    }).e
                )
            });
        })
    })
}
window.addEventListener('load', function () {
    modalOnShow('receipt_add', getItems);
    addListener('qty',        calculate_cost, 'input');
    addListener('cost_total', calculate_cost, 'input');
    addListener('sel_items',  reset_add_item, 'change');
    addFormListener(
        'receipt_add',
        'POST',
        '/canteen/receipts',
        {onComplete: getReceipts}
    )
});