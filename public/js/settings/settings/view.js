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
                    new Modal_Button(
                        _search(),
                        'setting_view',
                        [{
                            field: 'id',
                            value: setting.setting_id
                        }]
                    ).e
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
window.addEventListener('load', function () {
    add_listener('reload', getErrorLog);
    add_listener('reload', getOutLog);
    add_listener('reload', getPrinter);
    add_listener('reload', getSettings);
    addFormListener(
        'command',
        'POST',
        '/settings/command',
        {
            onComplete: [
                getErrorLog,
                getOutLog
            ]
        }
    );
    modalOnShow('setting_view', function (event) {viewSetting(event.relatedTarget.dataset.id)});
    add_sort_listeners('settings', getSettings);
    getSettings();
    getPrinter();
    getErrorLog();
    getOutLog();
});