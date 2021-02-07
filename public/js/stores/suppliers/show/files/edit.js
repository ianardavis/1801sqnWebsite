function viewFileEdit(file_id) {
    $('#mdl_file_view').modal('hide');
    get(
        {
            table: 'file',
            query: [`file_id=${file_id}`],
            spinner: 'file_edit'
        },
        function (file, options) {
            set_attribute({id: 'file_id_edit', attribute: 'value', value: file.file_id});
            set_value({id: '_description_edit', value: file._description});
        }
    );
};
window.addEventListener("load", function () {
    $('#mdl_file_edit').on('show.bs.modal', function (event) {viewFileEdit(event.relatedTarget.dataset.id)});
    $('#mdl_file_view').on('show.bs.modal', function (event) {
        let span_file_edit_btn = document.querySelector('#span_file_edit_btn');
        if (span_file_edit_btn) {
            span_file_edit_btn.innerHTML = '';
            span_file_edit_btn.appendChild(
                new Link({
                    modal: 'file_edit',
                    data: {field: 'id', value: event.relatedTarget.dataset.id},
                    type: 'edit'
                }).e
            )
        };
    });
    addFormListener(
        'file_edit',
        'PUT',
        '/stores/files',
        {onComplete: [
            getFiles,
            function () {$('#mdl_file_edit').modal('hide')}
        ]}
    );
});