function calculate_cost() {
    let qty        = document.querySelector('#qty_receipt'),
        cost_total = document.querySelector('#cost_total');
    if (qty.value > 0 && cost_total.value !== '') {
        set_value({id: 'cost_each', value: Number(cost_total.value / qty.value).toFixed(2)});
    };
};
window.addEventListener('load', function () {
    enable_button('receipt_add');
    set_attribute({id: 'item_id_receipt', attribute: 'value', value: path[2]});
    ['qty_receipt', 'cost_total'].forEach(e => {
        let input = document.querySelector(`#${e}`)
        if (input) input.addEventListener('input', calculate_cost);
    });
    addFormListener(
        'receipt_add',
        'POST',
        '/canteen/receipts',
        {
            onComplete: [
                getReceipts,
                getItem,
                function () {$('#mdl_receipt_add').modal('hide')}
            ]
        }
    );
});