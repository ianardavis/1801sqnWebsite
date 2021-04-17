window.addEventListener('load', function () {
    remove_attribute({id: 'btn_setting_add', attribute: 'disabled'});
    addFormListener(
        'setting_add',
        'POST',
        '/settings',
        {
            onComplete: [
                getSettings,
                function () {$('#mdl_setting_add').modal('hide')}
            ]
        }
    );
});