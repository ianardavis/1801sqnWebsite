function reset_receipt_add() {
    set_value('receipt_qty');
};
window.addEventListener('load', function () {
    modalOnShow('receipt_add', reset_receipt_add);
    enableButton('receipt_add');
    addFormListener(
        'receipt_add',
        'POST',
        '/stocks/receipts',
        {
            onComplete: [
                getStock,
                function () {modalHide('receipt_add')}
            ]
        }
    );
});