window.addEventListener('load', function () {
    enable_button('writeoff_add');
    set_attribute({id: 'item_id_writeoff', attribute: 'value', value: path[2]});
    addFormListener(
        'writeoff_add',
        'POST',
        '/writeoffs',
        {
            onComplete: [
                getWriteoffs,
                function () {modalHide('writeoff_add')}
            ]
        }
    );
});