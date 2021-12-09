function viewFileEdit(file_id) {
    modalHide('file_view');
    get({
        table: 'file',
        query: [`"file_id":"${file_id}"`],
        spinner: 'file_edit'
    })
    .then(function ([file, options]) {
        set_attribute('file_id_edit', 'value', file.file_id);
        set_value('file_description_edit', file.description);
    });
};
function fileEditBtn(file_id) {
    clear('span_file_edit_btn')
    .then(span_file_edit_btn => {
        span_file_edit_btn.appendChild(
            new Link({
                modal: 'file_edit',
                data: [{field: 'id', value: file_id}],
                type: 'edit',
                large: true
            }).e
        );
    });
};
window.addEventListener("load", function () {
    modalOnShow('file_view', function (event) {viewFileEdit(event.relatedTarget.dataset.id)});
    modalOnShow('file_view', function (event) {fileEditBtn( event.relatedTarget.dataset.id)});
    addFormListener(
        'file_edit',
        'PUT',
        '/files',
        {
            onComplete: [
                getFiles,
                function () {modalHide('file_edit')}
            ]
        }
    );
});