function getSettings() {
    clear('tbl_settings')
    .then(tbl_settings => {
        get({table: 'settings'})
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
        table: 'setting',
        query: ['name=printer'],
        spinner: 'printers'
    })
    .then(function ([setting, options]) {
        set_innerText({id: 'setting_printer', value: setting.value})
    })
};
function getErrorLog() {
    clear('log_error')
    .then(log_error => {
        get({
            table: 'logs',
            query: ['type=error'],
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
            query: ['type=out'],
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
        query: [`setting_id=${setting_id}`]
    })
    .then(function([setting, options]) {
        set_innerText({id: 'setting_id',        text: setting.setting_id});
        set_innerText({id: 'setting_name',      text: setting.name});
        set_innerText({id: 'setting_value',     text: setting.value});
        set_innerText({id: 'setting_createdAt', text: print_date(setting.createdAt, true)});
        set_innerText({id: 'setting_updatedAt', text: print_date(setting.updatedAt, true)});
    });
};
addReloadListener(getErrorLog);
addReloadListener(getOutLog);
addReloadListener(getPrinter);
addReloadListener(getSettings);
window.addEventListener('load', function () {
    modalOnShow('setting_view', function (event) {viewSetting(event.relatedTarget.dataset.id)});
});