window.addEventListener('load', function () {
    enableButton('writeoff_add');
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