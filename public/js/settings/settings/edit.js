function settingEditBtn(setting_id) {
    clear('setting_edit')
    .then(span_edit => {
        span_edit.appendChild(
            new Modal_Button(
                _edit(),
                'setting_edit',
                [{field: 'id', value: setting_id}],
                false
            ).e
        );
    });
};
function viewSettingEdit(setting_id) {
    modalHide('setting_view');
    get({
        table: 'setting',
        where: {setting_id: setting_id}
    })
    .then(function([setting, options]) {
        setAttribute('setting_id_edit', 'value', setting.setting_id);
        setValue('setting_name_edit',  setting.name);
        setValue('setting_value_edit', setting.value);
    });
};
window.addEventListener('load', function () {
    enableButton('logs_flush');
    enableButton('git_pull');
    enableButton('pm2_reload');
    addFormListener(
        'setting_edit',
        'PUT',
        '/settings',
        {
            onComplete: [
                getSettings,
                function () {modalHide('setting_edit')}
            ]
        }
    );
    addFormListener(
        'logs_flush',
        'POST',
        '/logs_flush',
        {onComplete: [
            getErrorLog,
            getOutLog
        ]}
    );
    addFormListener(
        'git_pull',
        'POST',
        '/git_pull'
    );
    addFormListener(
        'pm2_reload',
        'POST',
        '/pm2_reload',
        {onComplete: [
            function() {setTimeout(location.reload ,5000)}
        ]}
    );
    modalOnShow('setting_edit', function (event) {viewSettingEdit(event.relatedTarget.dataset.id)});
    modalOnShow('setting_view', function (event) {settingEditBtn( event.relatedTarget.dataset.id)});
});