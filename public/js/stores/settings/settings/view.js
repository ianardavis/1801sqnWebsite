let settings_loaded = false;
function getSettings() {
    settings_loaded = false;
    let tbl_settings = document.querySelector('#tbl_settings');
    if (tbl_settings) {
        tbl_settings.innerHTML = '';
        get(
            function (settings, options) {
                settings.forEach(setting => {
                    let row = tbl_settings.insertRow(-1);
                    add_cell(row, {text: setting._name});
                    add_cell(row, {text: setting._value});
                    add_cell(row, {classes: ['settings'], data: {field: 'id', value: setting.setting_id}});
                    add_cell(row, {append:
                        new Link({
                            modal: 'setting_view',
                            data: {
                                field: 'setting_id',
                                value: setting.setting_id
                            },
                            small: true
                        }).e
                    })
                });
                settings_loaded = true;
            },
            {
                table: 'settings',
                query: []
            }
        );
    };
};
window.addEventListener('load', function () {
    $('#mdl_setting_view').on('show.bs.modal', function (event) {
        get(
            function(setting, options) {
                set_innerText({id: '_name',             text: setting._name});
                set_innerText({id: '_value',            text: setting._value});
                set_innerText({id: 'user_setting',      text: print_user(setting.user)});
                set_innerText({id: 'createdAt_setting', text: print_date(setting.createdAt, true)});
                set_innerText({id: 'updatedAt_setting', text: print_date(setting.updatedAt, true)});
            },
            {
                table: 'setting',
                query: [`setting_id=${event.relatedTarget.dataset.setting_id}`]
            }
        );
    });
    document.querySelector('#reload').addEventListener('click', getSettings);
});