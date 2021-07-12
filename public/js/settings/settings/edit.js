function settingEditBtn(setting_id) {
    let span_edit = document.querySelector('#setting_edit');
    if (span_edit) {
        span_edit.innerHTML = '';
        span_edit.appendChild(
            new Link({
                modal: 'setting_edit',
                type: 'edit',
                data:  {field: 'id', value: setting_id}
            }).e
        );
    };
};
function viewSettingEdit(setting_id) {
    modalHide('setting_view');
    get({
        table: 'setting',
        query: [`setting_id=${setting_id}`]
    })
    .then(function([setting, options]) {
        set_attribute({id: 'setting_id_edit', attribute: 'value', value: setting.setting_id});
        set_value({id: 'setting_name_edit',  value: setting.name});
        set_value({id: 'setting_value_edit', value: setting.value});
    });
};
function getPrinters() {
    clear('tbl_printers')
    .then(tbl_printers => {
        get({table: 'printers'})
        .then(function ([printers, options]) {
            printers.forEach(printer => {
                let row = tbl_printers.insertRow(-1);
                add_cell(row, {append: new Radio({
                    attributes: [
                        {field: 'name',  value: 'printer'},
                        {field: 'value', value: printer.deviceId}
                    ],
                    small: true
                }).e});
                add_cell(row, {text: printer.deviceId});
            });
        });
    });
};
window.addEventListener('load', function () {
    enable_button('logs_flush');
    enable_button('git_pull');
    enable_button('pm2_reload');
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
        'printers',
        'POST',
        '/printers',
        {onComplete: getPrinter}
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
        '/pm2_reload'
    );
    addListener('btn_printers', getPrinters);
    modalOnShow('setting_edit', function (event) {viewSettingEdit(event.relatedTarget.dataset.id)});
    modalOnShow('setting_view', function (event) {settingEditBtn(event.relatedTarget.dataset.id)});
});