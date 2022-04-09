function getSettings() {
    clear('tbl_settings')
    .then(tbl_settings => {
        get({
            table: 'settings'
        })
        .then(function ([settings, options]) {
            settings.forEach(setting => {
                let row = tbl_settings.insertRow(-1);
                add_cell(row, {text: setting.name});
                add_cell(row, {text: setting.value});
                add_cell(row, {append:
                    new Button({
                        modal: 'setting_view',
                        data: [{
                            field: 'id',
                            value: setting.setting_id
                        }],
                        small: true
                    }).e
                })
            });
            if (typeof settingsEditBtns === 'function') settingsEditBtns();
        });
    });
};
function getPrinter() {
    get({
        table:   'setting',
        where:   {name: 'printer'},
        spinner: 'printers'
    })
    .then(function ([setting, options]) {
        set_innerText('setting_printer', setting.value)
    })
};
function getErrorLog() {
    clear('log_error')
    .then(log_error => {
        get({
            table: 'logs',
            where: {type: 'error'},
            spinner: 'log_error',
            streamAction: function (char) {
                log_error.innerText += char;
            }
        });
    });
};
function getOutLog() {
    clear('log_out')
    .then(log_out => {
        get({
            table: 'logs',
            where: {type: 'out'},
            spinner: 'log_out',
            streamAction: function (char) {
                log_out.innerText += char;
            }
        });
    });
};
function viewSetting(setting_id) {
    get({
        table: 'setting',
        where: {setting_id: setting_id}
    })
    .then(function([setting, options]) {
        set_innerText('setting_id',        setting.setting_id);
        set_innerText('setting_name',      setting.name);
        set_innerText('setting_value',     setting.value);
        set_innerText('setting_createdAt', print_date(setting.createdAt, true));
        set_innerText('setting_updatedAt', print_date(setting.updatedAt, true));
    });
};
addReloadListener(getErrorLog);
addReloadListener(getOutLog);
addReloadListener(getPrinter);
addReloadListener(getSettings);
sort_listeners(
    'settings',
    getSettings,
    [
        {value: '["createdAt"]', text: 'Created'},
        {value: '["name"]',      text: 'Setting', selected: true},
        {value: '["value"]',     text: 'Value'}
    ]
);
window.addEventListener('load', function () {
    modalOnShow('setting_view', function (event) {viewSetting(event.relatedTarget.dataset.id)});
});