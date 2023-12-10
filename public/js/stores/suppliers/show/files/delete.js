function fileDeleteBtn(event) {
    setAttribute('file_id_delete', 'value', event.relatedTarget.dataset.id);
}
window.addEventListener("load", function () {
    addFormListener(
        'file_delete',
        'DELETE',
        '/file',
        {
            onComplete: [
                getFiles,
                function () {modalHide('file_view')}
            ]
        }
    );
    enableButton('file_delete');
    modalOnShow('file_view', fileDeleteBtn);
});