function settingsEditBtn(setting_id) {
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
    $('#mdl_setting_view').modal('hide');
    get(
        {
            table: 'setting',
            query: [`setting_id=${setting_id}`]
        },
        function(setting, options) {
            set_attribute({id: 'setting_id_edit', attribute: 'value', value: setting.setting_id});
            set_value({id: 'setting_name_edit',  value: setting._name});
            set_value({id: 'setting_value_edit', value: setting._value});
        }
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
                function () {$('#mdl_setting_edit').modal('hide')}
            ]
        }
    );
    $('#mdl_setting_edit').on('show.bs.modal', function (event) {viewSettingEdit(event.relatedTarget.dataset.id)});
    $('#mdl_setting_view').on('show.bs.modal', function (event) {settingsEditBtn(event.relatedTarget.dataset.id)});
});