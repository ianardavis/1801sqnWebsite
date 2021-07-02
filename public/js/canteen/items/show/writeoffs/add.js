window.addEventListener('load', function () {
    enable_button('writeoff_add');
    addFormListener(
        'writeoff_add',
        'POST',
        '/writeoffs',
        {
            onComplete: [
                getWriteoffs,
                getItem,
                function () {modalHide('writeoff_add')}
            ]
        }
    );
});