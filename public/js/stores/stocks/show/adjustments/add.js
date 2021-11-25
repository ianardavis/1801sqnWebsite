function reset_add_adjustment() {
    set_value({id: 'adjustment_qty_add'});
};
window.addEventListener('load', function () {
    enable_button('adjustment_add');
    modalOnShow('adjustment_add', reset_add_adjustment);
    addFormListener(
        'adjustment_add',
        'POST',
        '/adjustments',
        {
            onComplete: [
                getStock,
                function () {modalHide('adjustment_add')}
            ]
        }
    );
});