function settingDeleteBtn(setting_id) {
    let span_delete = document.querySelector('#setting_delete');
    if (span_delete) {
        span_delete.innerHTML = '';
        span_delete.appendChild(
            new Delete_Button({
                descriptor: 'setting',
                path:       `/stores/settings/${setting_id}`,
                options: {
                    onComplete: [
                        getSettings,
                        function () {$('#mdl_setting_view').modal('hide')}
                    ]
                }
            }).e
        );
    };
};
window.addEventListener('load', function () {
    $('#mdl_setting_view').on('show.bs.modal', function (event) {settingDeleteBtn(event.relatedTarget.dataset.id)});
});