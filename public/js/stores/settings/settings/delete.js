window.addEventListener('load', function () {
    $('#mdl_setting_view').on('show.bs.modal', function (event) {
        let span_delete = document.querySelector('#setting_delete');
        if (span_delete) {
            span_delete.innerHTML = '';
            span_delete.appendChild(
                new Delete_Button({
                    descriptor: 'setting',
                    path: `/stores/settings/${event.relatedTarget.dataset.setting_id}`,
                    options: {
                        onComplete: [
                            getSettings,
                            function () {
                                if (typeof loadSettingsEdit === 'function') loadSettingsEdit();
                                $('#mdl_setting_view').modal('hide')
                            }
                        ]
                    }
                }).e
            );
        };
    });
});