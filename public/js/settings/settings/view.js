function getSettings() {
    clear_table('settings')
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
function viewSetting(setting_id) {
    get({
        table: 'setting',
        query: [`setting_id=${setting_id}`]
    })
    .then(function([setting, options]) {
        console.log(setting);
        set_innerText({id: 'setting_name',      text: setting.name});
        set_innerText({id: 'setting_value',     text: setting.value});
        set_innerText({id: 'setting_createdAt', text: print_date(setting.createdAt, true)});
        set_innerText({id: 'setting_updatedAt', text: print_date(setting.updatedAt, true)});
    });
};
addReloadListener(getSettings);
window.addEventListener('load', function () {
    modalOnShow('setting_view', function (event) {viewSetting(event.relatedTarget.dataset.id)});
});