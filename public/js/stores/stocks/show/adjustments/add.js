function reset_add_adjustment() {
    set_value({id: 'adjustment_qty_add'});
};
window.addEventListener('load', function () {
    enable_button('adjustment_add');
    $('#mdl_adjustment_add').on('show.bs.modal', reset_add_adjustment);
    addFormListener(
        'adjustment_add',
        'POST',
        '/adjustments',
        {
            onComplete: [
                getStock,
                getAdjustments,
                function () {$('#mdl_adjustment_add').modal('hide')}
            ]
        }
    );
});