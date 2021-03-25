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
    get(
        {table: 'items'},
        function (items, options) {
            let sel_items = document.querySelector('#sel_items');
            if (sel_items) {
                sel_items.innerHTML = '';
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
                            text: item._name
                        }).e
                    )
                });
            }
        }
    )
}
window.addEventListener('load', function () {
    $('#mdl_receipt_add').on('show.bs.modal', getItems);
    ['qty', 'cost_total'].forEach(e => {
        let input = document.querySelector(`#${e}`)
        if (input) input.addEventListener('input', calculate_cost);
    });
    let sel_items = document.querySelector('#sel_items');
    if (sel_items) sel_items.addEventListener('change', reset_add_item);
    addFormListener(
        'receipt_add',
        'POST',
        '/canteen/receipts',
        {onComplete: getReceipts}
    )
});