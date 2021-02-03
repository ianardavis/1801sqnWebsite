function SettingsEdit() {
    document.querySelectorAll('.settings').forEach(e => {
        get(
            function(setting, options) {
                e.appendChild(
                    new Link({
                        modal: 'setting_edit',
                        small: true,
                        type: 'edit',
                        data:  {field: 'setting_id', value: setting.setting_id}
                    }).e
                );
                e.removeAttribute('data-id');
                e.removeAttribute('class');
            },
            {
                table: 'setting',
                query: [`setting_id=${e.dataset.id}`]
            }
        );
    });
};
function loadSettingsEdit() {
    let get_interval = window.setInterval(
        function () {
            if (settings_loaded === true) {
                SettingsEdit();
                clearInterval(get_interval);
            };
        },
        200
    );
};
window.addEventListener('load', function () {
    addFormListener(
        'setting_edit',
        'PUT',
        '/stores/settings',
        {
            onComplete: [
                getSettings,
                loadSettingsEdit,
                function () {$('#mdl_setting_edit').modal('hide')}
            ]
        }
    );
    $('#mdl_setting_edit').on('show.bs.modal', function (event) {
        get(
            function(setting, options) {
                set_attribute({id: 'setting_id_edit', attribute: 'value', value: setting.setting_id});
                set_value({id: '_name_edit',  value: setting._name});
                set_value({id: '_value_edit', value: setting._value});
            },
            {
                table: 'setting',
                query: [`setting_id=${event.relatedTarget.dataset.setting_id}`]
            }
        );
    });
    document.querySelector('#reload').addEventListener('click', loadSettingsEdit);
});