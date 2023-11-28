function getSettings() {
    clear('tbl_settings')
    .then(tbl_settings => {
        get({
            table: 'settings'
        })
        .then(function ([settings, options]) {
            settings.forEach(setting => {
                let row = tbl_settings.insertRow(-1);
                addCell(row, {text: setting.name});
                addCell(row, {text: setting.value});
                addCell(row, {append:
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
        setInnerText('setting_printer', setting.value)
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
        setInnerText('setting_id',        setting.setting_id);
        setInnerText('setting_name',      setting.name);
        setInnerText('setting_value',     setting.value);
        setInnerText('setting_createdAt', printDate(setting.createdAt, true));
        setInnerText('setting_updatedAt', printDate(setting.updatedAt, true));
    });
};
window.addEventListener('load', function () {
    addListener('reload', getErrorLog);
    addListener('reload', getOutLog);
    addListener('reload', getPrinter);
    addListener('reload', getSettings);
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
    addSortListeners('settings', getSettings);
    getSettings();
    getPrinter();
    getErrorLog();
    getOutLog();
});