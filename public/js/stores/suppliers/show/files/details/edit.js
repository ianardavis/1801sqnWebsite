function viewDetailEdit(file_detail_id) {
    $('#mdl_file_view').modal('hide');
    get(
        {
            table:   'file_detail',
            query:   [`file_detail_id=${file_detail_id}`],
            spinner: 'file_detail_edit'
        },
        function (detail, options) {
            set_attribute({id: 'file_detail_id_edit', attribute: 'value', value: detail.file_detail_id});
            set_value({id: '_name_detail_edit',  value: detail._name});
            set_value({id: '_value_detail_edit', value: detail._value});
        }
    )
};
function addDetailEditBtns() {
    document.querySelectorAll('.file_details_edit').forEach(e => {
        get(
            {
                table: 'file_detail',
                query: [`file_detail_id=${e.dataset.id}`]
            },
            function (detail, options) {
                e.appendChild(
                    new Link({
                        modal: 'file_detail_edit',
                        data:  {field: 'id', value: detail.file_detail_id},
                        small: true,
                        type:  'edit'
                    }).e
                );
            }
        );
    });
};
window.addEventListener('load', function () {
    addFormListener(
        'file_detail_edit',
        'PUT',
        '/stores/file_details',
        {onComplete: function () {$('#mdl_file_detail_edit').modal('hide')}}
    );
    $('#mdl_file_detail_edit').on('show.bs.modal', function (event) {viewDetailEdit(event.relatedTarget.dataset.id)});
});