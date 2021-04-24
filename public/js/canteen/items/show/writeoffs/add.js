window.addEventListener('load', function () {
    enable_button('writeoff_add');
    set_attribute({id: 'item_id_writeoff', attribute: 'value', value: path[2]});
    addFormListener(
        'writeoff_add',
        'POST',
        '/canteen/writeoffs',
        {
            onComplete: [
                getWriteoffs,
                function () {$('#mdl_writeoff_add').modal('hide')}
            ]
        }
    );
});