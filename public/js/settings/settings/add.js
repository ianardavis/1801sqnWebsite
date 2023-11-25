window.addEventListener('load', function () {
    enableButton('setting_add');
    addFormListener(
        'setting_add',
        'POST',
        '/settings',
        {
            onComplete: [
                getSettings,
                function () {modalHide('setting_add')}
            ]
        }
    );
});