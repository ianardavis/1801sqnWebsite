function fileDeleteBtn(file_id) {
    clear('span_file_delete_btn')
    .then(span_file_delete_btn => {
        span_file_delete_btn.appendChild(
            new Delete_Button({
                descriptor: 'file',
                path: `/files/${file_id}`,
                options: {
                    onComplete: [
                        getFiles,
                        function () {modalHide('file_view')}
                    ]
                }
            }).e
        );
    });
}
window.addEventListener("load", function () {
    modalOnShow('file_view', function (event) {fileDeleteBtn(event.relatedTarget.dataset.id)});
});