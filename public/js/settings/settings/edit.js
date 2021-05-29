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
function getPrinters() {
    clear_table('printers')
    .then(tbl_printers => {
        get({table: 'printers'})
        .then(function ([printers, options]) {
            console.log(printers)
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
    addListener('btn_printers', getPrinters);
    modalOnShow('setting_edit', function (event) {viewSettingEdit(event.relatedTarget.dataset.id)});
    modalOnShow('setting_view', function (event) {settingEditBtn(event.relatedTarget.dataset.id)});
});