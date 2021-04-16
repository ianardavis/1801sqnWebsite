function fileDeleteBtn(file_id) {
    let span_file_delete_btn = document.querySelector('#span_file_delete_btn');
    if (span_file_delete_btn) {
        span_file_delete_btn.innerHTML = '';
        span_file_delete_btn.appendChild(
            new Delete_Button({
                descriptor: 'file',
                path: `/files/${file_id}`,
                options: {onComplete: [
                    getFiles,
                    function () {$('#mdl_file_view').modal('hide')}
                ]}
            }).e
        );
    };
}
window.addEventListener("load", function () {
    $('#mdl_file_view').on('show.bs.modal', function (event) {fileDeleteBtn(event.relatedTarget.dataset.id)});
});