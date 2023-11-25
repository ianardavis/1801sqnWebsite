function calculate_cost() {
    let qty        = document.querySelector('#qty_receipt'),
        cost_total = document.querySelector('#cost_total');
    if (qty.value > 0 && cost_total.value !== '') {
        set_value('cost_each', Number(cost_total.value / qty.value).toFixed(2));
    };
};
window.addEventListener('load', function () {
    enableButton('receipt_add');
    ['qty_receipt', 'cost_total'].forEach(e => {
        let input = document.querySelector(`#${e}`)
        if (input) input.addEventListener('input', calculate_cost);
    });
    addFormListener(
        'receipt_add',
        'POST',
        '/receipts',
        {
            onComplete: [
                getReceipts,
                getItem,
                function () {modalHide('receipt_add')}
            ]
        }
    );
});