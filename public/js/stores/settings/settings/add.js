window.addEventListener('load', function () {
    addFormListener(
        'setting_add',
        'POST',
        '/stores/settings',
        {
            onComplete: [
                getSettings,
                loadSettingsEdit,
                function () {$('#mdl_setting_add').modal('hide')}
            ]
        }
    );
});