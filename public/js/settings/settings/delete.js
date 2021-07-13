function settingDeleteBtn(setting_id) {
    clear('setting_delete')
    .then(span_delete => {
        span_delete.appendChild(
            new Delete_Button({
                descriptor: 'setting',
                path:       `/settings/${setting_id}`,
                options: {
                    onComplete: [
                        getSettings,
                        function () {modalHide('setting_view')}
                    ]
                }
            }).e
        );
    });
};
window.addEventListener('load', function () {
    modalOnShow('setting_view', function (event) {settingDeleteBtn(event.relatedTarget.dataset.id)});
});