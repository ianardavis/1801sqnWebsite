window.addEventListener('load', function () {
    enable_button('setting_add');
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