function getSettings() {
    let tbl_settings = document.querySelector('#tbl_settings');
    if (tbl_settings) {
        tbl_settings.innerHTML = '';
        get(
            {table: 'settings'},
            function (settings, options) {
                settings.forEach(setting => {
                    let row = tbl_settings.insertRow(-1);
                    add_cell(row, {text: setting._name});
                    add_cell(row, {text: setting._value});
                    add_cell(row, {append:
                        new Link({
                            modal: 'setting_view',
                            data: {
                                field: 'id',
                                value: setting.setting_id
                            },
                            small: true
                        }).e
                    })
                });
                if (typeof settingsEditBtns === 'function') settingsEditBtns();
            }
        );
    };
};
function viewSetting(setting_id) {
    get(
        {
            table: 'setting',
            query: [`setting_id=${setting_id}`]
        },
        function(setting, options) {
            set_innerText({id: 'setting_name',      text: setting._name});
            set_innerText({id: 'setting_value',     text: setting._value});
            set_innerText({id: 'setting_user',      text: print_user(setting.user)});
            set_innerText({id: 'setting_createdAt', text: print_date(setting.createdAt, true)});
            set_innerText({id: 'setting_updatedAt', text: print_date(setting.updatedAt, true)});
        }
    );
};
window.addEventListener('load', function () {
    $('#mdl_setting_view').on('show.bs.modal', function (event) {viewSetting(event.relatedTarget.dataset.id)});
    document.querySelector('#reload').addEventListener('click', getSettings);
});