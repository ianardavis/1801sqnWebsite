window.addEventListener('load', function () {
    remove_attribute({id: 'btn_writeoff_add', attribute: 'disabled'});
    set_attribute({id: 'item_id_writeoff', attribute: 'value', value: path[3]});
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