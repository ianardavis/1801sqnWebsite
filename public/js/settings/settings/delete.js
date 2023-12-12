function settingDeleteBtn(event) {
    setAttribute('setting_id_delete', 'value', event.relatedTarget.dataset.id);
};
window.addEventListener('load', function () {
    enableButton('setting_delete');
    addFormListener(
        'link_delete',
        'DELETE',
        '/settings',
        {
            onComplete: [
                getSettings,
                function () {modalHide('setting_view')}
            ]
        }
    );
    modalOnShow('setting_view', settingDeleteBtn);
});